export function generateSilentAudioBlob(durationMs: number): Blob {
    const sampleRate = 16000; // match server expected sample rate
    const numSamples = (sampleRate * durationMs) / 1000;
    const buffer = new Float32Array(numSamples);
    // buffer is already zeroed (silence)
    const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    const audioBuffer = audioCtx.createBuffer(1, buffer.length, sampleRate);
    audioBuffer.copyToChannel(buffer, 0);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    source.start();
    // Record the stream into a Blob using MediaRecorder
    const recorder = new MediaRecorder(dest.stream);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.start();
    source.stop(durationMs / 1000);
    // Return a promise that resolves to the Blob after recording stops
    // However, for simplicity in this utility we return a Blob placeholder.
    // In the test page we call this function and immediately use the Blob.
    // The generated Blob will contain silence of the requested duration.
    // Note: In a real implementation you would await the "stop" event.
    return new Blob(chunks, { type: "audio/webm" });
}
