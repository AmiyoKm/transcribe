from fastapi import APIRouter, Depends, WebSocket
from faster_whisper.transcribe import WhisperModel

from lib.model import get_model
from lib.transcription import TranscriptionService

router = APIRouter()


@router.websocket("/transcribe")
async def websocket_endpoint(
    websocket: WebSocket, model: WhisperModel = Depends(get_model)
):
    transcription_service = TranscriptionService(websocket, model)
    await transcription_service.handle_websocket()
