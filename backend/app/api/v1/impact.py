from fastapi import APIRouter, Depends
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.impact import HouseholdImpactResponse
from backend.app.services.impact_service import impact_service

router = APIRouter(prefix="/impact", tags=["Impact"])


@router.get("", response_model=APIResponse[HouseholdImpactResponse])
async def get_household_impact(
    current_user: User = Depends(get_current_user),
):
    """Get environmental impact and recycling metrics for the authenticated household."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    impact_data = await impact_service.get_household_impact(user_id=user_id)
    return APIResponse.respond(data=impact_data)
