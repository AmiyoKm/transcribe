from unittest.mock import patch

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from middleware.auth import get_current_user
from schemas.user import UserSchema

app = FastAPI()


@app.get("/users/me", response_model=UserSchema)
async def read_users_me(current_user: UserSchema = Depends(get_current_user)):
    return current_user


client = TestClient(app)


def test_get_current_user_invalid_token():
    with patch("middleware.auth.decode_access_token", return_value=None):
        response = client.get("/users/me", headers={"Authorization": "Bearer invalid"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Could not validate credentials"


def test_get_current_user_no_sub():
    with patch("middleware.auth.decode_access_token", return_value={"no": "sub"}):
        response = client.get("/users/me", headers={"Authorization": "Bearer valid"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Could not validate credentials"


def test_get_current_user_invalid_uuid():
    with patch(
        "middleware.auth.decode_access_token", return_value={"sub": "invalid-uuid"}
    ):
        response = client.get("/users/me", headers={"Authorization": "Bearer valid"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Could not validate credentials"
