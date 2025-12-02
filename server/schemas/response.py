from typing import Any, Optional

from pydantic import BaseModel

from schemas.session import SessionSchema
from schemas.user import UserSchema


class BaseResponse(BaseModel):
    message: str


class Response(BaseResponse):
    data: Optional[Any] = None


class SessionResponse(BaseResponse):
    data: list[SessionSchema] = []


class SingleSessionResponse(BaseResponse):
    data: SessionSchema


class SignUpResponseData(BaseModel):
    access_token: str
    user: UserSchema


class SignUpResponse(BaseResponse):
    data: SignUpResponseData


class LoginResponseData(BaseModel):
    access_token: str


class LoginResponse(BaseResponse):
    data: LoginResponseData
