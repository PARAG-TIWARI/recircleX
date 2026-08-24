from typing import List
from fastapi import APIRouter, Depends, Query, status
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse, ListingListResponse
from backend.app.services.listing_service import listing_service

router = APIRouter(prefix="/listings", tags=["Listings"])


@router.post("", response_model=APIResponse[ListingResponse], status_code=status.HTTP_201_CREATED)
async def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new recyclable waste listing."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    listing = await listing_service.create_listing(user_id=user_id, data=payload)
    return APIResponse.respond(
        data=ListingResponse(**listing.model_dump()),
        message="Listing created successfully",
    )


@router.get("/my", response_model=APIResponse[ListingListResponse])
async def get_my_listings(
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
):
    """Get all listings created by the authenticated household."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    items = await listing_service.get_my_listings(user_id=user_id, limit=limit, skip=skip)
    total = await listing_service.get_my_listings_count(user_id=user_id)
    return APIResponse.respond(
        data=ListingListResponse(
            items=[ListingResponse(**item.model_dump()) for item in items],
            total=total,
        )
    )



@router.get("/materials", response_model=APIResponse[dict])
async def get_materials_and_rates():
    """Retrieve accepted materials and their pricing rates."""
    from backend.app.services.ai_service import MATERIAL_RATES
    return APIResponse.respond(data=MATERIAL_RATES)


@router.get("/{listing_id}", response_model=APIResponse[ListingResponse])
async def get_listing_detail(
    listing_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get detail of a specific listing."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    listing = await listing_service.get_listing(listing_id=listing_id, user_id=user_id)
    return APIResponse.respond(data=ListingResponse(**listing.model_dump()))


@router.patch("/{listing_id}", response_model=APIResponse[ListingResponse])
async def update_listing(
    listing_id: str,
    payload: ListingUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a listing."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    updated = await listing_service.update_listing(listing_id=listing_id, user_id=user_id, data=payload)
    return APIResponse.respond(
        data=ListingResponse(**updated.model_dump()),
        message="Listing updated successfully",
    )


@router.delete("/{listing_id}", response_model=APIResponse[bool])
async def delete_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a listing."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    success = await listing_service.delete_listing(listing_id=listing_id, user_id=user_id)
    return APIResponse.respond(data=success, message="Listing deleted")
