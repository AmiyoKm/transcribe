from fastapi import APIRouter, Depends, Query, WebSocket, status
from faster_whisper.transcribe import WhisperModel
from sqlalchemy.orm import Session

from db.base import get_db
from lib.auth import get_user_from_token
from lib.model import get_model
from lib.transcription import TranscriptionService

router = APIRouter()


@router.websocket(
    "/transcribe",
)
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    model: WhisperModel = Depends(get_model),
    db: Session = Depends(get_db),
):
    user = get_user_from_token(token, db)
    print(user)
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    transcription_service = TranscriptionService(websocket, model, db, user)
    await transcription_service.handle_websocket()
