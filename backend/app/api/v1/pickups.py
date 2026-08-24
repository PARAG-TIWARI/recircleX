from fastapi import APIRouter, Depends, Query, status
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.pickup import PickupCreate, PickupResponse, PickupListResponse
from backend.app.services.pickup_service import pickup_service

router = APIRouter(prefix="/pickups", tags=["Pickups"])



@router.get("/available-slots", response_model=APIResponse[dict])
async def get_available_slots():
    """Retrieve available doorstep collection slots for the next 5 days."""
    from datetime import datetime, timedelta
    from backend.app.repositories.pickup_repository import pickup_repository
    
    slots = ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"]
    result = {}
    
    # Check next 5 days
    for i in range(1, 6):
        day_date = datetime.now() + timedelta(days=i)
        day_str = day_date.strftime("%A, %b %d") # e.g. "Monday, Aug 24"
        
        available_for_day = []
        for slot in slots:
            preferred_time_search = f"{day_str} {slot}"
            count = await pickup_repository.collection.count_documents({"preferred_time": preferred_time_search})
            if count < 5:
                available_for_day.append(slot)
        
        result[day_str] = available_for_day
        
    return APIResponse.respond(data=result)


@router.post("", response_model=APIResponse[PickupResponse], status_code=status.HTTP_201_CREATED)
async def create_pickup(
    payload: PickupCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new pickup request for an available listing."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    pickup = await pickup_service.create_pickup(user_id=user_id, data=payload)
    return APIResponse.respond(
        data=pickup,
        message="Pickup requested successfully",
    )


@router.get("/my", response_model=APIResponse[PickupListResponse])
async def get_my_pickups(
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
):
    """Get all pickups for the authenticated household."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    items = await pickup_service.get_my_pickups(user_id=user_id, limit=limit, skip=skip)
    return APIResponse.respond(
        data=PickupListResponse(
            items=items,
            total=len(items),
        )
    )


@router.get("/{pickup_id}", response_model=APIResponse[PickupResponse])
async def get_pickup_detail(
    pickup_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get detail and tracking info for a specific pickup."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    pickup = await pickup_service.get_pickup(pickup_id=pickup_id, user_id=user_id)
    return APIResponse.respond(data=pickup)
