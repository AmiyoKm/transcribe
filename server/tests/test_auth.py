from fastapi.testclient import TestClient

from schemas.user import UserSchema


def test_signup(client: TestClient):
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_signup_duplicate_email(client: TestClient):
    client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login(client: TestClient):
    client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "access_token" in data


def test_login_invalid_credentials(client: TestClient):
    client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid credentials"


def test_login_user_not_found(client: TestClient):
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "password"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_get_me(client: TestClient):
    signup_response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    token = signup_response.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    user = UserSchema(**response.json()["data"])
    assert user.email == "test@example.com"


def test_get_me_unauthenticated(client: TestClient):
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
