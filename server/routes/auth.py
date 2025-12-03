from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.base import get_db
from db.models import User
from lib.auth import create_access_token, get_password_hash, verify_password
from middleware.auth import get_current_user
from schemas.auth import UserLogin, UserSignup
from schemas.response import (
    LoginResponse,
    LoginResponseData,
    SignUpResponse,
    SignUpResponseData,
    UserMeResponse,
)
from schemas.user import UserSchema

router = APIRouter()


@router.post("/signup", response_model=SignUpResponse)
def signup(user: UserSignup, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})

    return SignUpResponse(
        message="User created successfully",
        data=SignUpResponseData(
            access_token=access_token, user=UserSchema.model_validate(new_user)
        ),
    )


@router.post("/login", response_model=LoginResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(db_user.id)})

    return LoginResponse(
        message="User logged in successfully",
        data=LoginResponseData(access_token=access_token),
    )


@router.get("/me", response_model=UserMeResponse)
def me(user: User = Depends(get_current_user)):
    return UserMeResponse(
        message="User retrieved successfully", data=UserSchema.model_validate(user)
    )
