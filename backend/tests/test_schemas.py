import pytest
from backend.app.schemas.auth import AuthSyncRequest
from backend.app.models.user import UserRole


def test_auth_sync_payload_validation():
    payload = AuthSyncRequest(
        clerk_user_id="user_test123",
        email="citizen@recyclex.org",
        role=UserRole.HOUSEHOLD,
        portal="INDIVIDUAL",
        name="Citizen Member",
    )
    assert payload.clerk_user_id == "user_test123"
    assert payload.role == UserRole.HOUSEHOLD
    assert payload.portal == "INDIVIDUAL"


def test_invalid_portal_role_validation():
    with pytest.raises(Exception):
        AuthSyncRequest(
            clerk_user_id="user_test123",
            email="collector@recyclex.org",
            role="INVALID_ROLE",
            portal="INDIVIDUAL",
        )
