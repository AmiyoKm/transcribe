"use client";

import { useEffect, useRef, useState } from "react";

export default function Recorder() {
	const [status, setStatus] = useState<"idle" | "recording">("idle");
	const wsRef = useRef<WebSocket | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);

	// -------------------------------------------------
	// 1️⃣ Open the WebSocket when the component mounts
	// -------------------------------------------------
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8000/ws/transcribe");
		ws.binaryType = "arraybuffer";

		ws.onopen = () => console.log("WebSocket opened");
		ws.onmessage = (ev) => {
			const data = JSON.parse(ev.data);
			if (data.partial) console.log("Partial →", data.partial);
			if (data.error) console.error("Error:", data.error);
		};
		ws.onclose = () => console.log("WebSocket closed");

		wsRef.current = ws;
		return () => ws.close();
	}, []);

	// -------------------------------------------------
	// 2️⃣ Start / stop recording
	// -------------------------------------------------
	const start = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: { sampleRate: 16000, channelCount: 1 },
		});

		// MediaRecorder will give us raw WebM/Opus by default.
		// To get **PCM** we need to decode it – the simplest hack is to use
		// `audio/webm;codecs=opus` and then convert to PCM on the server.
		// For a pure‑PCM stream you can use a library like `Recorder.js`,
		// but for a quick demo this works fine.

		const recorder = new MediaRecorder(stream, {
			mimeType: "audio/webm;codecs=opus",
		});

		recorder.ondataavailable = (e) => {
			// Convert Blob → ArrayBuffer → Uint8Array and send raw bytes
			e.data.arrayBuffer().then((buf) => {
				wsRef.current?.send(buf);
			});
		};

		recorder.start(200); // emit a chunk every 200 ms
		mediaRecorderRef.current = recorder;
		setStatus("recording");
	};

	const stop = () => {
		mediaRecorderRef.current?.stop();
		setStatus("idle");
	};

	return (
		<div className="p-4">
			{status === "idle" ? (
				<button onClick={start} className="btn-primary">
					Start Recording
				</button>
			) : (
				<button onClick={stop} className="btn-danger">
					Stop
				</button>
			)}
		</div>
	);
}
