import asyncio
import io
from datetime import datetime
from typing import Optional, TypedDict

from fastapi import WebSocket, WebSocketDisconnect
from faster_whisper import WhisperModel
from sqlalchemy.orm import Session

from db.models import Session as SessionModel
from db.models import User
from lib.config import settings


class TranscriptionResult(TypedDict):
    text: str
    language: str
    probability: float
    error: Optional[str]


class TranscriptionService:
    def __init__(
        self,
        websocket: WebSocket,
        model: WhisperModel,
        db: Session,
        user: User,
    ):
        self.websocket = websocket
        self.model = model
        self.db = db
        self.user = user
        self.buffer = bytearray()
        self.last_sent_len = 0
        self.start_time = datetime.now()
        self.final_transcript = ""
        self.language = "en"
        self.model_used = "faster-whisper-tiny"

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
            self._save_session()
        except Exception as e:
            model_task.cancel()
            print(f"Error: {e}")
            self._save_session()
            await self.websocket.close()

    async def _run_model_periodically(
        self,
    ):
        while True:
            await asyncio.sleep(settings.CHUNK_INTERVAL)

            result = await asyncio.to_thread(self._transcribe_audio, bytes(self.buffer))

            new_text = result["text"][self.last_sent_len :]
            if new_text and new_text != ".":
                await self.websocket.send_json(
                    {
                        "partial": new_text,
                        "language": result["language"],
                        "probability": result["probability"],
                        "length": len(result["text"]),
                        "transcription": result["text"],
                    }
                )
                self.last_sent_len = len(result["text"])
                self.final_transcript = result["text"]
                self.language = result["language"]

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

    def _save_session(self):
        end_time = datetime.now()
        duration_seconds = int((end_time - self.start_time).total_seconds())
        word_count = len(self.final_transcript.split())

        session = SessionModel(
            user_id=self.user.id,
            start_time=self.start_time,
            end_time=end_time,
            duration_seconds=duration_seconds,
            final_transcript=self.final_transcript,
            word_count=word_count,
            language=self.language,
            model_used=self.model_used,
        )
        self.db.add(session)
        self.db.commit()
        print("Session saved to database")
