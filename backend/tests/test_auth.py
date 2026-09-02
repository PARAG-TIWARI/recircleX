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
    return jwt.encode(payload, "mock_test_secret_key_32_bytes_long_12345", algorithm="HS256")


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


def test_auth_sync_new_user_creation():
    """Verify that a completely new user (no matching clerk_id or email) is created successfully."""
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.models.user import User, UserRole, UserStatus
    from backend.app.models.profile import Profile

    token = generate_mock_jwt(sub="user_brand_new_500", role="HOUSEHOLD")

    created_user = User(
        clerk_user_id="user_brand_new_500",
        email="brandnew@recyclex.in",
        role=UserRole.HOUSEHOLD,
        status=UserStatus.ACTIVE,
    )
    created_profile = Profile(
        user_id="user_brand_new_500",
        name="brandnew",
    )

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        # clerk_id lookup returns None (new user), email lookup returns None (new email)
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=None)
        u_repo_instance.get_by_email = AsyncMock(return_value=None)
        u_repo_instance.create = AsyncMock(return_value=created_user)
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        p_repo_instance.get_by_user_id = AsyncMock(return_value=None)
        p_repo_instance.create = AsyncMock(return_value=created_profile)
        mock_svc_prof_repo.return_value = p_repo_instance

        response = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_brand_new_500",
                "email": "brandnew@recyclex.in",
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["user"]["clerk_user_id"] == "user_brand_new_500"
        # Verify create was called (not just returned from lookup)
        u_repo_instance.create.assert_called_once()
        p_repo_instance.create.assert_called_once()


def test_auth_sync_reconcile_by_email():
    """Verify that when clerk_user_id is not found but email matches an existing user,
    the existing user is reconciled (clerk_user_id updated) instead of creating a duplicate."""
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.models.user import User, UserRole, UserStatus
    from backend.app.models.profile import Profile

    token = generate_mock_jwt(sub="user_new_clerk_300", role="HOUSEHOLD")

    # Existing user with OLD clerk_user_id but same email
    existing_user = User(
        clerk_user_id="user_old_clerk_100",
        email="alice@recyclex.in",
        role=UserRole.HOUSEHOLD,
        status=UserStatus.ACTIVE,
    )
    existing_user.id = "mongo_id_abc123"

    existing_profile = Profile(
        user_id="user_old_clerk_100",
        name="Alice",
    )
    existing_profile.id = "profile_id_xyz789"

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        # clerk_id lookup returns None (new clerk ID), email lookup returns existing user
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=None)
        u_repo_instance.get_by_email = AsyncMock(return_value=existing_user)
        u_repo_instance.update = AsyncMock(return_value=existing_user)
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        # Profile lookup for NEW clerk_id returns None (profile still keyed on old ID)
        # but get_by_user_id for OLD clerk_id returns the existing profile
        p_repo_instance.get_by_user_id = AsyncMock(side_effect=lambda uid: existing_profile if uid == "user_old_clerk_100" else None)
        p_repo_instance.update = AsyncMock(return_value=existing_profile)
        p_repo_instance.create = AsyncMock(return_value=existing_profile)
        mock_svc_prof_repo.return_value = p_repo_instance

        response = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_new_clerk_300",
                "email": "alice@recyclex.in",
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
                "name": "Alice",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Verify the user's clerk_user_id was updated (reconciled)
        u_repo_instance.update.assert_any_call(
            "mongo_id_abc123",
            {
                "clerk_user_id": "user_new_clerk_300",
                "updated_at": u_repo_instance.update.call_args_list[0][0][1]["updated_at"],
            },
        )
        # Verify the old profile's user_id was also reconciled
        p_repo_instance.update.assert_any_call(
            "profile_id_xyz789",
            {
                "user_id": "user_new_clerk_300",
                "updated_at": p_repo_instance.update.call_args_list[0][0][1]["updated_at"],
            },
        )


def test_auth_sync_idempotent_repeated_call():
    """Verify that calling auth sync twice with the same data is idempotent and returns 200 both times."""
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.models.user import User, UserRole, UserStatus
    from backend.app.models.profile import Profile

    token = generate_mock_jwt(sub="user_idem_400", role="HOUSEHOLD")

    mock_user = User(
        clerk_user_id="user_idem_400",
        email="idempotent@recyclex.in",
        role=UserRole.HOUSEHOLD,
        status=UserStatus.ACTIVE,
    )
    mock_profile = Profile(
        user_id="user_idem_400",
        name="Idem User",
    )

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        # User already exists by clerk_id — same email, no updates needed
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=mock_user)
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        p_repo_instance.get_by_user_id = AsyncMock(return_value=mock_profile)
        mock_svc_prof_repo.return_value = p_repo_instance

        # First call
        response1 = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_idem_400",
                "email": "idempotent@recyclex.in",
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
                "name": "Idem User",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response1.status_code == 200

        # Second call (identical)
        response2 = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_idem_400",
                "email": "idempotent@recyclex.in",
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
                "name": "Idem User",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response2.status_code == 200
        assert response1.json() == response2.json()

        # No create or update calls should have been made (data unchanged)
        u_repo_instance.create.assert_not_called()
        u_repo_instance.update.assert_not_called()


def test_auth_sync_duplicate_key_returns_409():
    """Verify that a DuplicateKeyError from MongoDB returns 409 Conflict, not 503."""
    from unittest.mock import AsyncMock, patch, MagicMock
    from pymongo.errors import DuplicateKeyError

    token = generate_mock_jwt(sub="user_dup_600", role="HOUSEHOLD")

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        # clerk_id not found, email not found, but create raises DuplicateKeyError (race condition)
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=None)
        u_repo_instance.get_by_email = AsyncMock(return_value=None)
        u_repo_instance.create = AsyncMock(
            side_effect=DuplicateKeyError("E11000 duplicate key error collection: recyclex_db.users index: email_1")
        )
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        mock_svc_prof_repo.return_value = p_repo_instance

        response = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_dup_600",
                "email": "duplicate@recyclex.in",
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        # Must be 409 Conflict, NOT 503
        assert response.status_code == 409
        res_data = response.json()
        error_detail = res_data.get("message") or res_data.get("detail", "") or res_data.get("error", {}).get("detail", "")
        assert "already exists" in error_detail


def test_auth_sync_db_failure_still_returns_503():
    """Verify that genuine database connectivity errors still return 503 (not 409)."""
    from unittest.mock import AsyncMock, patch, MagicMock

    token = generate_mock_jwt(sub="user_dbfail_700", role="HOUSEHOLD")

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        u_repo_instance.get_by_clerk_id = AsyncMock(
            side_effect=Exception("ServerSelectionTimeoutError: connection timed out")
        )
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        mock_svc_prof_repo.return_value = p_repo_instance

        response = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_dbfail_700",
                "email": "dbfail@recyclex.in",
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 503
        res_data = response.json()
        error_detail = res_data.get("message") or res_data.get("detail", "") or res_data.get("error", {}).get("detail", "")
        assert "Database service currently unavailable" in error_detail


def test_auth_sync_email_update_conflict():
    """Verify that updating email to one owned by another user returns 409."""
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.models.user import User, UserRole, UserStatus
    from backend.app.models.profile import Profile

    token = generate_mock_jwt(sub="user_emailconf_800", role="HOUSEHOLD")

    # The user being synced
    current_user = User(
        clerk_user_id="user_emailconf_800",
        email="old_email@recyclex.in",
        role=UserRole.HOUSEHOLD,
        status=UserStatus.ACTIVE,
    )
    current_user.id = "mongo_id_current"

    # Another user who already owns the target email
    other_user = User(
        clerk_user_id="user_other_900",
        email="taken@recyclex.in",
        role=UserRole.HOUSEHOLD,
        status=UserStatus.ACTIVE,
    )
    other_user.id = "mongo_id_other"

    mock_profile = Profile(user_id="user_emailconf_800", name="User 800")

    with patch("backend.app.core.security.UserRepository") as mock_sec_user_repo, \
         patch("backend.app.services.auth_service.UserRepository") as mock_svc_user_repo, \
         patch("backend.app.services.auth_service.ProfileRepository") as mock_svc_prof_repo:

        u_repo_instance = MagicMock()
        u_repo_instance.get_by_clerk_id = AsyncMock(return_value=current_user)
        # Email lookup returns the OTHER user (conflict)
        u_repo_instance.get_by_email = AsyncMock(return_value=other_user)
        mock_sec_user_repo.return_value = u_repo_instance
        mock_svc_user_repo.return_value = u_repo_instance

        p_repo_instance = MagicMock()
        p_repo_instance.get_by_user_id = AsyncMock(return_value=mock_profile)
        mock_svc_prof_repo.return_value = p_repo_instance

        response = client.post(
            "/api/v1/auth/sync",
            json={
                "clerk_user_id": "user_emailconf_800",
                "email": "taken@recyclex.in",  # email belongs to other_user
                "role": "HOUSEHOLD",
                "portal": "INDIVIDUAL",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 409
        res_data = response.json()
        error_detail = res_data.get("message") or res_data.get("detail", "") or res_data.get("error", {}).get("detail", "")
        assert "already associated with another account" in error_detail
