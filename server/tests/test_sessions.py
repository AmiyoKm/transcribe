import uuid
from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from db.models import Session as SessionModel


def test_get_sessions(client: TestClient, db_session: Session):
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    user_id_str = response.json()["data"]["user"]["id"]
    user_id = uuid.UUID(user_id_str)

    session = SessionModel(
        id=uuid.uuid4(),
        user_id=user_id,
        start_time=datetime.now(UTC),
        end_time=datetime.now(UTC),
        duration_seconds=60,
        final_transcript="Hello world",
        word_count=2,
    )
    db_session.add(session)
    db_session.commit()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/sessions/", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["final_transcript"] == "Hello world"


def test_get_sessions_unauthenticated(client: TestClient):
    response = client.get("/sessions/")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_get_session(client: TestClient, db_session: Session):
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    user_id_str = response.json()["data"]["user"]["id"]
    user_id = uuid.UUID(user_id_str)

    session_id = uuid.uuid4()
    session = SessionModel(
        id=session_id,
        user_id=user_id,
        start_time=datetime.now(UTC),
        end_time=datetime.now(UTC),
        duration_seconds=60,
        final_transcript="Hello world",
        word_count=2,
    )
    db_session.add(session)
    db_session.commit()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/sessions/{session_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["final_transcript"] == "Hello world"


def test_get_session_not_found(client: TestClient):
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/sessions/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Session not found"


def test_delete_session(client: TestClient, db_session: Session):
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    user_id_str = response.json()["data"]["user"]["id"]
    user_id = uuid.UUID(user_id_str)

    session_id = uuid.uuid4()
    session = SessionModel(
        id=session_id,
        user_id=user_id,
        start_time=datetime.now(UTC),
        end_time=datetime.now(UTC),
        duration_seconds=60,
        final_transcript="Hello world",
        word_count=2,
    )
    db_session.add(session)
    db_session.commit()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.delete(f"/sessions/{session_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Session deleted successfully"

    response = client.get(f"/sessions/{session_id}", headers=headers)
    assert response.status_code == 404
