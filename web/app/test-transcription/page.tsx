"use client";

import { createWebSocket, fetchLatestSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TranscriptionPage() {
	const [transcript, setTranscript] = useState("");
	const [sessionInfo, setSessionInfo] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [isRecording, setIsRecording] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const router = useRouter();

	const startRecording = async () => {
		const token = localStorage.getItem("authToken");
		if (!token) {
			router.push("/login");
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "audio/webm",
			});
			mediaRecorderRef.current = mediaRecorder;

			const ws = createWebSocket(token);
			wsRef.current = ws;

			ws.onopen = () => {
				mediaRecorder.start(1000); // Send data every 1 second
			};

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
					ws.send(event.data);
				}
			};

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.partial) {
					setTranscript(data.transcription);
				}
			};

			ws.onclose = async () => {
				try {
					const session = await fetchLatestSession(token);
					if (session) {
						setSessionInfo(
							`Saved Session - Duration: ${session.duration_seconds}s, Words: ${session.word_count}, Language: ${session.language}`,
						);
					}
				} catch (e: any) {
					setError("Failed to fetch session: " + e.message);
				}
			};

			ws.onerror = (e) => {
				console.error("WebSocket error:", e);
				setError("WebSocket error. See console for details.");
			};
		} catch (err) {
			setError("Could not start recording: " + err);
		}

		setIsRecording(true);
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
		}
		if (wsRef.current) {
			wsRef.current.close();
		}
		setIsRecording(false);
	};

	useEffect(() => {
		// Cleanup on component unmount
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
			}
			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.stop();
			}
		};
	}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
			<h1 className="text-2xl font-bold mb-4">Live Transcription</h1>
			<div className="flex gap-4 mb-4">
				<button
					onClick={startRecording}
					disabled={isRecording}
					className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
				>
					Start Recording
				</button>
				<button
					onClick={stopRecording}
					disabled={!isRecording}
					className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
				>
					Stop Recording
				</button>
			</div>
			{error && <p className="text-red-500 mb-2">{error}</p>}
			<pre
				className="bg-white p-4 rounded shadow w-full max-w-2xl overflow-auto mb-4 text-black"
				style={{ height: "200px" }}
			>
				{transcript || "Waiting for transcription..."}
			</pre>
			{sessionInfo && <p className="text-green-700">{sessionInfo}</p>}
		</div>
	);
}
