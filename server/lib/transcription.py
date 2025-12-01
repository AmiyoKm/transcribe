import asyncio
import io
from typing import Optional, TypedDict

from fastapi import WebSocket, WebSocketDisconnect
from faster_whisper import WhisperModel

from lib.constansts import CHUNK_INTERVAL


class TranscriptionResult(TypedDict):
    text: str
    language: str
    probability: float
    error: Optional[str]


class TranscriptionService:
    def __init__(
        self,
        websocket: WebSocket,
        model_size: str = "tiny",
        device: str = "cpu",
        compute_type: str = "int8",
    ):
        self.websocket = websocket
        self.model = WhisperModel(model_size, device=device, compute_type=compute_type)
        self.buffer = bytearray()
        self.last_sent_len = 0

    async def handle_websocket(self):
        await self.websocket.accept()

        model_task = asyncio.create_task(self._run_model_periodically())
        try:
            while True:
                data = await self.websocket.receive_bytes()
                self.buffer.extend(data)
        except WebSocketDisconnect:
            model_task.cancel()
            print("Client disconnected")
        except Exception as e:
            model_task.cancel()
            print(f"Error: {e}")
            await self.websocket.close()

    async def _run_model_periodically(
        self,
    ):
        while True:
            await asyncio.sleep(CHUNK_INTERVAL)

            result = self._transcribe_audio(bytes(self.buffer))
            new_text = result["text"][self.last_sent_len :]
            if new_text and new_text != ".":
                await self.websocket.send_json(
                    {
                        "partial": new_text,
                        "language": result["language"],
                        "probability": result["probability"],
                        "length": len(result["text"]),
                    }
                )
                self.last_sent_len = len(result["text"])

    def _transcribe_audio(self, audio_data: bytes) -> TranscriptionResult:
        audio_file = io.BytesIO(audio_data)

        try:
            segments, info = self.model.transcribe(audio_file)
            result_text = " ".join([segment.text for segment in segments])

            return {
                "text": result_text,
                "language": info.language,
                "probability": info.language_probability,
                "error": None,
            }
        except Exception as e:
            return {
                "text": "",
                "language": "en",
                "probability": 0.0,
                "error": str(e),
            }
