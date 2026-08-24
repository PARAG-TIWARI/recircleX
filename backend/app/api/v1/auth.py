from fastapi import APIRouter, Depends
from backend.app.db.mongodb import get_database
from backend.app.schemas.auth import AuthSyncRequest
from backend.app.schemas.common import APIResponse
from backend.app.schemas.user import UserRead
from backend.app.schemas.profile import ProfileRead
from backend.app.services.auth_service import AuthService
from backend.app.core.security import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/sync", response_model=APIResponse)
async def sync_authenticated_user(
    payload: AuthSyncRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_database),
):
    """Sync Clerk user identity with MongoDB Atlas and enforce portal role separation."""
    auth_service = AuthService(db)
    user, profile = await auth_service.sync_user(payload)

    return APIResponse(
        success=True,
        message="User profile synchronized successfully",
        data={
            "user": {
                "id": str(user.id) if user.id else None,
                "clerk_user_id": user.clerk_user_id,
                "email": user.email,
                "role": user.role.value,
                "status": user.status.value,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
            },
            "profile": {
                "id": str(profile.id) if profile.id else None,
                "user_id": profile.user_id,
                "name": profile.name,
                "phone": profile.phone,
                "avatar_url": profile.avatar_url,
                "company_name": profile.company_name,
                "location": profile.location,
            },
        },
    )
