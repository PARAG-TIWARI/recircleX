from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.core.security import get_current_user
from backend.app.db.mongodb import get_database
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.profile import ProfileRead, ProfileUpdate
from backend.app.services.user_service import UserService

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=APIResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db=Depends(get_database),
):
    """Retrieve profile associated with the authenticated user."""
    user_service = UserService(db)
    profile = await user_service.get_profile(current_user.clerk_user_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return APIResponse(
        success=True,
        message="Profile retrieved",
        data={
            "id": str(profile.id) if profile.id else None,
            "user_id": profile.user_id,
            "name": profile.name,
            "phone": profile.phone,
            "avatar_url": profile.avatar_url,
            "company_name": profile.company_name,
            "location": profile.location,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
        },
    )


@router.put("/me", response_model=APIResponse)
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_database),
):
    """Update profile details for the authenticated user."""
    user_service = UserService(db)
    updated_profile = await user_service.update_profile(current_user.clerk_user_id, payload)

    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found to update",
        )

    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data={
            "id": str(updated_profile.id) if updated_profile.id else None,
            "user_id": updated_profile.user_id,
            "name": updated_profile.name,
            "phone": updated_profile.phone,
            "avatar_url": updated_profile.avatar_url,
            "company_name": updated_profile.company_name,
            "location": updated_profile.location,
            "updated_at": updated_profile.updated_at,
        },
    )
