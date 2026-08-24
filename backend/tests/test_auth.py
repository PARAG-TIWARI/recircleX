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
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.models.user import User, UserRole, UserStatus
    from backend.app.models.profile import Profile

    token = generate_mock_jwt(sub="user_household_100", role="HOUSEHOLD")

    mock_user = User(
        clerk_user_id="user_household_100",
        email="household@recyclex.in",
        role=UserRole.HOUSEHOLD,
        status=UserStatus.ACTIVE,
    )
    mock_profile = Profile(
        user_id="user_household_100",
        name="Jane Citizen",
    )

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=mock_user)
        u_repo_instance.create = AsyncMock(return_value=mock_user)
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        p_repo_instance.get_by_user_id = AsyncMock(return_value=mock_profile)
        p_repo_instance.create = AsyncMock(return_value=mock_profile)
        mock_svc_prof_repo.return_value = p_repo_instance

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
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.models.user import User, UserRole, UserStatus
    from backend.app.models.profile import Profile

    token = generate_mock_jwt(sub="user_ent_200", role="ENTERPRISE")

    mock_user = User(
        clerk_user_id="user_ent_200",
        email="corp@brand.com",
        role=UserRole.ENTERPRISE,
        status=UserStatus.ACTIVE,
    )
    mock_profile = Profile(
        user_id="user_ent_200",
        company_name="EcoBrand Global",
    )

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=mock_user)
        u_repo_instance.create = AsyncMock(return_value=mock_user)
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        p_repo_instance.get_by_user_id = AsyncMock(return_value=mock_profile)
        p_repo_instance.create = AsyncMock(return_value=mock_profile)
        mock_svc_prof_repo.return_value = p_repo_instance

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
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.models.user import User, UserRole, UserStatus

    token = generate_mock_jwt(sub="user_hacker", role="ENTERPRISE")
    mock_user = User(clerk_user_id="user_hacker", role=UserRole.ENTERPRISE, status=UserStatus.ACTIVE)

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo:
        u_repo_instance = MagicMock()
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=mock_user)
        mock_sec_user_repo.return_value = u_repo_instance

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
