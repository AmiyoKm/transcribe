import asyncio
import io
import json
from datetime import UTC, datetime
from typing import Optional, TypedDict, cast

from fastapi import WebSocket, WebSocketDisconnect
from faster_whisper import WhisperModel
from sqlalchemy import UUID
from sqlalchemy.orm import Session

from db.models import Session as SessionModel
from db.models import User
from lib.config import settings


class TranscriptionResult(TypedDict):
    text: str
    language: str


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
        self.start_time = datetime.now(UTC)
        self.final_transcript: str = ""
        self.language: str = "en"
        self.model_used: str = "faster-whisper-tiny"
        self._partial_min_len = 1

    async def handle_websocket(self) -> None:
        await self.websocket.accept()
        model_task = asyncio.create_task(self._run_model_periodically())

        try:
            while True:
                message = await self.websocket.receive()
                if message.get("bytes"):
                    self.buffer.extend(message["bytes"])
                elif message.get("text"):
                    data = json.loads(message["text"])
                    if data.get("type") == "stop":
                        break

        except WebSocketDisconnect:
            pass
        finally:
            model_task.cancel()
            try:
                await model_task
            except asyncio.CancelledError:
                pass

            await self._finalize_and_notify()

    async def _run_model_periodically(self) -> None:
        while True:
            await asyncio.sleep(settings.CHUNK_INTERVAL)
            if not self.buffer:
                continue

            result = await asyncio.to_thread(self._transcribe_audio, bytes(self.buffer))

            new_text = result["text"][self.last_sent_len :]
            if new_text and len(new_text) >= self._partial_min_len:
                await self._send_partial(new_text)
                self.last_sent_len = len(result["text"])

            self.final_transcript = result["text"]
            self.language = result["language"]

    def _transcribe_audio(self, audio_data: bytes) -> TranscriptionResult:
        audio_file = io.BytesIO(audio_data)
        try:
            segments, info = self.model.transcribe(audio_file)
            text = " ".join([segment.text for segment in segments])
            return {
                "text": text,
                "language": info.language,
            }
        except Exception:
            return {"text": "", "language": "en"}

    async def _send_partial(self, new_text: str) -> None:
        payload = {"type": "partial", "partial": new_text}
        await self.websocket.send_json(payload)

    async def _finalize_and_notify(self) -> None:
        if self.buffer:
            result = await asyncio.to_thread(self._transcribe_audio, bytes(self.buffer))
            if result["text"]:
                self.final_transcript = result["text"]
            if result.get("language"):
                self.language = result["language"]

        session_id, metadata = self._save_session()

        final_payload = {
            "type": "final",
            "session_id": str(session_id) if session_id else None,
            "transcription": self.final_transcript,
            "length": len(self.final_transcript),
            "words": metadata.get("word_count"),
            "duration_seconds": metadata.get("duration_seconds"),
            "language": self.language,
            "model_used": self.model_used,
        }

        await self.websocket.send_json(final_payload)

    def _save_session(self) -> tuple[Optional[UUID], dict]:
        end_time = datetime.now(UTC)
        duration = int((end_time - self.start_time).total_seconds())
        word_count = len(self.final_transcript.split())

        session = SessionModel(
            user_id=self.user.id,
            start_time=self.start_time,
            end_time=end_time,
            duration_seconds=duration,
            final_transcript=self.final_transcript,
            word_count=word_count,
            language=self.language,
            model_used=self.model_used,
        )

        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        session_id = session.id

        metadata = {"duration_seconds": duration, "word_count": word_count}

        session_uuid = cast(Optional[UUID], session_id)
        return session_uuid, metadata
