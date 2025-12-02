from typing import Any, Optional

from pydantic import BaseModel


class Response(BaseModel):
    message: str
    data: Optional[Any] = None
