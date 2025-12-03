from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.base import get_db
from db.models import Session as SessionModel
from db.models import User
from middleware.auth import get_current_user
from schemas.response import BaseResponse, SessionResponse, SingleSessionResponse
from schemas.session import SessionSchema

router = APIRouter()


@router.get("/", response_model=SessionResponse)
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
    return SessionResponse(
        message="Sessions retrieved successfully",
        data=[SessionSchema.model_validate(s) for s in sessions[::-1]],
    )


@router.get("/{session_id}", response_model=SingleSessionResponse)
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

    return SingleSessionResponse(
        message="Session retrieved successfully",
        data=SessionSchema.model_validate(session),
    )


@router.delete("/{session_id}", response_model=BaseResponse)
def delete_session(
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

    db.delete(session)
    db.commit()

    return BaseResponse(
        message="Session deleted successfully",
    )
