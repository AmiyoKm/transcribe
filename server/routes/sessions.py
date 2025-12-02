from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.db import get_db
from middleware.auth import get_current_user
from models.response import Response
from models.sessions import Session as SessionModel
from models.user import User

router = APIRouter()


@router.get("/", response_model=Response)
def get_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"message": "Sessions retrieved successfully", "data": sessions}


@router.get("/{session_id}",response_model=Response)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id, SessionModel.user_id == current_user.id)
        .first()
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
