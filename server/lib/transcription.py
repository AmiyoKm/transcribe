# transcribe/server/lib/transcription.py
import asyncio
import io
import logging
from datetime import datetime
from typing import Optional, TypedDict

from fastapi import WebSocket, WebSocketDisconnect
from faster_whisper import WhisperModel
from sqlalchemy.orm import Session

from db.models import Session as SessionModel
from db.models import User
from lib.config import settings

logger = logging.getLogger(__name__)


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

        self.start_time = datetime.utcnow()
        self.final_transcript: str = ""
        self.language: str = "en"
        self.model_used: str = "faster-whisper-tiny"

        self._partial_min_len = 1

    async def handle_websocket(self) -> None:
        await self.websocket.accept()

        model_task = asyncio.create_task(self._run_model_periodically())

        try:
            while True:
                data = await self.websocket.receive_bytes()
                if data:
                    self.buffer.extend(data)
        except WebSocketDisconnect:
            logger.info("WebSocket client disconnected, performing finalization.")

            model_task.cancel()
            try:
                await model_task
            except asyncio.CancelledError:
                pass

            await self._finalize_and_notify()
        except Exception as exc:
            logger.exception("Unexpected error in WebSocket loop: %s", exc)
            model_task.cancel()
            try:
                await model_task
            except asyncio.CancelledError:
                pass

            await self._finalize_and_notify(error=str(exc))

            try:
                await self.websocket.close()
            except Exception:
                pass

    async def _run_model_periodically(self) -> None:
        try:
            while True:
                await asyncio.sleep(settings.CHUNK_INTERVAL)

                result = await asyncio.to_thread(
                    self._transcribe_audio, bytes(self.buffer)
                )

                new_text = result["text"][self.last_sent_len :]

                if new_text and len(new_text) >= self._partial_min_len:
                    await self._send_partial(new_text)

                    self.last_sent_len = len(result["text"])
                    self.final_transcript = result["text"]
                    self.language = result["language"]
        except asyncio.CancelledError:
            logger.debug("Periodic transcription task cancelled.")
            raise
        except Exception as exc:
            logger.exception("Error in periodic transcription task: %s", exc)
            raise

    def _transcribe_audio(self, audio_data: bytes) -> TranscriptionResult:
        audio_file = io.BytesIO(audio_data)
        try:
            segments, info = self.model.transcribe(audio_file)
            result_text = " ".join([segment.text for segment in segments])

            return {
                "text": result_text,
                "language": getattr(info, "language", "en"),
                "probability": getattr(info, "language_probability", 0.0),
                "error": None,
            }
        except Exception as exc:
            logger.exception("Transcription failed: %s", exc)
            return {
                "text": "",
                "language": "en",
                "probability": 0.0,
                "error": str(exc),
            }

    async def _send_partial(self, new_text: str) -> None:
        payload = {"type": "partial", "partial": new_text}
        try:
            await self.websocket.send_json(payload)
        except Exception as exc:
            logger.debug("Failed to send partial to client: %s", exc)

    async def _finalize_and_notify(self, error: Optional[str] = None) -> None:
        try:
            result = await asyncio.to_thread(self._transcribe_audio, bytes(self.buffer))
            if result["text"]:
                self.final_transcript = result["text"]
            if result.get("language"):
                self.language = result["language"]
        except Exception as exc:
            logger.exception("Final transcription pass failed: %s", exc)

        session_id, metadata = self._save_session()

        final_payload = {
            "type": "final",
            "session_id": session_id,
            "transcription": self.final_transcript,
            "length": len(self.final_transcript),
            "words": metadata.get("word_count"),
            "duration_seconds": metadata.get("duration_seconds"),
            "language": self.language,
            "model_used": self.model_used,
        }

        if error:
            final_payload["error"] = error

        try:
            await self.websocket.send_json(final_payload)
        except Exception as exc:
            logger.debug("Could not send final message to client: %s", exc)

    def _save_session(self) -> tuple[Optional[int], dict]:
        end_time = datetime.utcnow()
        duration_seconds = int((end_time - self.start_time).total_seconds())
        word_count = len(self.final_transcript.split()) if self.final_transcript else 0

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

        try:
            self.db.add(session)
            self.db.commit()
            try:
                self.db.refresh(session)
            except Exception:
                pass
            session_id = getattr(session, "id", None)
            logger.info(
                "Saved transcription session id=%s user_id=%s", session_id, self.user.id
            )
        except Exception as exc:
            logger.exception("Failed to save session to DB: %s", exc)
            try:
                self.db.rollback()
            except Exception:
                pass
            session_id = None

        metadata = {"duration_seconds": duration_seconds, "word_count": word_count}
        return session_id, metadata
