"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { RecordingButton } from "@/components/transcription/recording-button";
import { TranscriptionDisplay } from "@/components/transcription/transcription-display";
import { TranscriptionWebSocket, type FinalPayload } from "@/lib/websocket";
import { FinalizingLoader } from "@/components/transcription/finalizing-loader";

export default function HomePage() {
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [isRecording, setIsRecording] = useState(false);
	const [displayText, setDisplayText] = useState("");
	const [error, setError] = useState("");
	const [isFinalizing, setIsFinalizing] = useState(false);

	const wsRef = useRef<TranscriptionWebSocket | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleFinalPayload = useCallback(
		(payload: FinalPayload) => {
			if (payload.error) {
				setError(payload.error);
			} else {
				setDisplayText("");
				router.push(`/session/${payload.session_id}`);
				setIsFinalizing(false);
			}
		},
		[router],
	);

	const startRecording = async () => {
		try {
			setError("");
			setDisplayText("");

			// getting the media stream and referecing the recorder
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;

			const token = localStorage.getItem("access_token");
			if (!token) {
				throw new Error("No authentication token");
			}

			// initialiing the websocket and setting the reference
			const ws = new TranscriptionWebSocket(token);
			wsRef.current = ws;

			// setting up the callback functions for the ws object
			ws.setOnPartial((partialText: string) => {
				setDisplayText((prev) => prev + partialText);
			});

			ws.setOnFinal(handleFinalPayload);

			ws.setOnError((error: string) => {
				setError(error);
				stopRecording();
			});

			// connecting to the ws and starting the user media recording
			await ws.connect();
			mediaRecorder.start(100);

			mediaRecorder.ondataavailable = (event) => {
				if (ws.isConnected()) {
					ws.sendAudio(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				stream.getTracks().forEach((track) => track.stop());
			};

			setIsRecording(true);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to start recording",
			);
		}
	};

	const stopRecording = async () => {
		try {
			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.stop();
			}

			// send stop message to server
			if (wsRef.current) {
				wsRef.current.sendStopMessage();
				setIsFinalizing(true);
			}

			setIsRecording(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to stop recording",
			);
		}
	};

	const handleRecordingClick = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	if (authLoading) {
		return (
			<AppLayout>
				<div className="flex items-center justify-center h-full">
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<div className="flex flex-col items-center justify-center min-h-full p-6 space-y-8">
				<div className="text-center space-y-2 max-w-2xl">
					<h1 className="text-4xl font-bold text-foreground">
						Real-time Transcription
					</h1>
					<p className="text-muted-foreground">
						Click the microphone button to start recording. Your
						speech will be transcribed in real-time.
					</p>
				</div>

				{error && (
					<div className="w-full max-w-3xl p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
						{error}
					</div>
				)}

				<TranscriptionDisplay
					partialText={displayText}
					isRecording={isRecording}
				/>

				<RecordingButton
					isRecording={isRecording}
					onClick={handleRecordingClick}
					disabled={isFinalizing}
				/>

				<div className="text-center text-sm text-muted-foreground">
					{isFinalizing ? (
						<FinalizingLoader />
					) : isRecording ? (
						<p>Listening...</p>
					) : (
						<p>Ready to start</p>
					)}
				</div>
			</div>
		</AppLayout>
	);
}
