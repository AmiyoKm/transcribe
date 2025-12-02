from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.db import get_db
from lib.auth import create_access_token, get_password_hash, verify_password
from models.auth import UserLogin, UserSignup
from models.user import User

router = APIRouter()


@router.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    data = {
        "id": new_user.id,
        "email": new_user.email,
        "created_at": new_user.created_at.isoformat(),
    }

    return {"message": "User created successfully", "data": data}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {
        "message": "User logged in successfully",
        "data": {"access_token": access_token, "token_type": "bearer"},
    }
