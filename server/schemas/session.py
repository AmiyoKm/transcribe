from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SessionSchema(BaseModel):
    id: UUID
    user_id: UUID
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    final_transcript: str
    word_count: int
    language: Optional[str] = None
    model_used: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
