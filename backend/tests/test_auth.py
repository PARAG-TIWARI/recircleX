import time
import jwt
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def generate_mock_jwt(sub: str = "user_test123", role: str = "HOUSEHOLD", expired: bool = False) -> str:
    payload = {
        "sub": sub,
        "email": f"{sub}@example.com",
        "role": role,
        "exp": int(time.time()) + (-3600 if expired else 3600),
    }
    return jwt.encode(payload, "secret", algorithm="HS256")


def test_auth_sync_unauthenticated():
    """Verify that /api/v1/auth/sync rejects unauthenticated requests with 401."""
    response = client.post(
        "/api/v1/auth/sync",
        json={
            "clerk_user_id": "user_test123",
            "email": "user_test123@example.com",
            "role": "HOUSEHOLD",
            "portal": "INDIVIDUAL",
        },
    )
    assert response.status_code == 401
    res_data = response.json()
    assert "Authentication credentials were not provided" in (res_data.get("message") or res_data["error"]["detail"])


def test_auth_sync_expired_token():
    """Verify that /api/v1/auth/sync rejects expired JWT tokens with 401."""
    token = generate_mock_jwt(expired=True)
    response = client.post(
        "/api/v1/auth/sync",
        json={
            "clerk_user_id": "user_test123",
            "email": "user_test123@example.com",
            "role": "HOUSEHOLD",
            "portal": "INDIVIDUAL",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401


def test_auth_sync_valid_household():
    """Verify successful user synchronization for HOUSEHOLD persona."""
    token = generate_mock_jwt(sub="user_household_100", role="HOUSEHOLD")
    response = client.post(
        "/api/v1/auth/sync",
        json={
            "clerk_user_id": "user_household_100",
            "email": "household@recyclex.in",
            "role": "HOUSEHOLD",
            "portal": "INDIVIDUAL",
            "name": "Jane Citizen",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["clerk_user_id"] == "user_household_100"
    assert data["data"]["user"]["role"] == "HOUSEHOLD"


def test_auth_sync_valid_enterprise():
    """Verify successful user synchronization for ENTERPRISE persona in business portal."""
    token = generate_mock_jwt(sub="user_ent_200", role="ENTERPRISE")
    response = client.post(
        "/api/v1/auth/sync",
        json={
            "clerk_user_id": "user_ent_200",
            "email": "corp@brand.com",
            "role": "ENTERPRISE",
            "portal": "BUSINESS",
            "company_name": "EcoBrand Global",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["role"] == "ENTERPRISE"
    assert data["data"]["profile"]["company_name"] == "EcoBrand Global"


def test_auth_sync_portal_boundary_violation():
    """Verify that cross-portal role escalation (e.g. ENTERPRISE in INDIVIDUAL portal) returns 400."""
    token = generate_mock_jwt(sub="user_hacker", role="ENTERPRISE")
    response = client.post(
        "/api/v1/auth/sync",
        json={
            "clerk_user_id": "user_hacker",
            "email": "hacker@domain.com",
            "role": "ENTERPRISE",
            "portal": "INDIVIDUAL",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    res_data = response.json()
    assert "not permitted in Individual portal" in (res_data.get("message") or res_data["error"]["detail"])
