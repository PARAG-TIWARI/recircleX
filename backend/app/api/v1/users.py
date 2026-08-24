from fastapi import APIRouter, Depends
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=APIResponse)
async def get_my_user(current_user: User = Depends(get_current_user)):
    """Retrieve authenticated user details and verified role from MongoDB."""
    return APIResponse(
        success=True,
        message="User profile retrieved",
        data={
            "id": str(current_user.id) if current_user.id else None,
            "clerk_user_id": current_user.clerk_user_id,
            "email": current_user.email,
            "role": current_user.role.value,
            "status": current_user.status.value,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
        },
    )
