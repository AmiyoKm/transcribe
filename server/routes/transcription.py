from fastapi import APIRouter, WebSocket

from lib.transcription import TranscriptionService

router = APIRouter()


@router.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    transcription_service = TranscriptionService(websocket)
    await transcription_service.handle_websocket()
