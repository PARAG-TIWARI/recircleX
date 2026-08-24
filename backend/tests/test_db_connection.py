import time
import jwt
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.mongodb import db_manager

client = TestClient(app)


def generate_test_jwt(sub: str = "user_db_test_100", role: str = "HOUSEHOLD") -> str:
    payload = {
        "sub": sub,
        "email": f"{sub}@recyclex.in",
        "role": role,
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, "secret", algorithm="HS256")


def test_health_check_database_online():
    """Verify that /api/v1/health returns 200 when database ping succeeds."""
    mock_client = MagicMock()
    mock_admin = MagicMock()
    mock_admin.command = AsyncMock(return_value={"ok": 1})
    mock_client.admin = mock_admin

    with patch.object(db_manager, "client", mock_client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "healthy"
        assert data["data"]["database"]["status"] == "connected"


def test_health_check_database_offline():
    """Verify that /api/v1/health returns HTTP 503 when database ping fails."""
    mock_client = MagicMock()
    mock_admin = MagicMock()
    mock_admin.command = AsyncMock(side_effect=Exception("The DNS query name does not exist"))
    mock_client.admin = mock_admin

    with patch.object(db_manager, "client", mock_client):
        response = client.get("/api/v1/health")
        assert response.status_code == 503
        data = response.json()
        assert data["success"] is False
        assert data["data"]["status"] == "degraded"
        assert "unreachable" in data["data"]["database"]["status"]


def test_auth_sync_database_failure_returns_503():
    """Verify that /api/v1/auth/sync returns 503 when database access fails (no fake in-memory fallbacks)."""
    token = generate_test_jwt(sub="user_offline_test")
    
    with patch("backend.app.core.security.UserRepository") as mock_user_repo_cls:
        mock_repo = MagicMock()
        mock_repo.get_by_clerk_id = AsyncMock(side_effect=Exception("MongoDB Connection Timeout"))
        mock_user_repo_cls.return_value = mock_repo
        
        response = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_offline_test",
                "email": "user_offline@recyclex.in",
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 503
        res_data = response.json()
        assert "Database service currently unavailable" in (res_data.get("message") or res_data.get("detail", ""))
