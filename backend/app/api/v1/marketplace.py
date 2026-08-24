from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from backend.app.core.security import get_current_user, require_role
from backend.app.models.user import User, UserRole
from backend.app.schemas.common import APIResponse
from backend.app.schemas.marketplace import (
    MarketplaceListingCreate,
    MarketplaceListingResponse,
    MarketplaceListingListResponse,
    ReserveListingRequest,
    AIListingEnhanceRequest,
    AIListingEnhanceResponse,
)
from backend.app.schemas.order import OrderResponse
from backend.app.services.marketplace_service import marketplace_service

router = APIRouter(prefix="/marketplace", tags=["B2B Marketplace"])


@router.get("/listings", response_model=APIResponse[MarketplaceListingListResponse])
async def get_marketplace_listings(
    category: Optional[str] = Query(default=None),
    material: Optional[str] = Query(default=None),
    quality: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort_by: Optional[str] = Query(default=None),
    status_filter: str = Query(default="ACTIVE"),
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    """Public / Authenticated catalog of active B2B recycling scrap listings."""
    res = await marketplace_service.get_listings(
        category=category,
        material=material,
        quality=quality,
        city=city,
        search=search,
        sort_by=sort_by,
        status_filter=status_filter,
        limit=limit,
        skip=skip,
    )
    return APIResponse.respond(data=res)


@router.get("/listings/{listing_id}", response_model=APIResponse[MarketplaceListingResponse])
async def get_listing_detail(listing_id: str):
    """Get full details of a specific marketplace lot."""
    detail = await marketplace_service.get_listing_detail(listing_id)
    return APIResponse.respond(data=detail)


@router.post("/listings", response_model=APIResponse[MarketplaceListingResponse])
async def create_marketplace_listing(
    payload: MarketplaceListingCreate,
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Publish collected warehouse inventory to the B2B marketplace."""
    seller_id = current_user.clerk_user_id or current_user.id
    listing = await marketplace_service.create_b2b_listing(seller_id=seller_id, payload=payload)
    return APIResponse.respond(data=listing, message="Listing published to B2B marketplace successfully")


@router.post("/listings/{listing_id}/reserve", response_model=APIResponse[OrderResponse])
async def reserve_marketplace_listing(
    listing_id: str,
    payload: ReserveListingRequest,
    current_user: User = Depends(require_role(UserRole.RECYCLER, UserRole.ENTERPRISE, UserRole.ADMIN)),
):
    """Reserve a B2B marketplace lot and create a confirmed procurement contract order."""
    buyer_id = current_user.clerk_user_id or current_user.id
    order = await marketplace_service.reserve_listing(
        buyer_id=buyer_id, listing_id=listing_id, payload=payload
    )
    return APIResponse.respond(data=order, message="Material reserved successfully. Contract order created.")


@router.post("/ai-enhance", response_model=APIResponse[AIListingEnhanceResponse])
async def ai_enhance_b2b_listing(
    payload: AIListingEnhanceRequest,
    current_user: User = Depends(get_current_user),
):
    """AI Assistant: generate commercial grade listing title, technical description, and pricing."""
    enhanced = await marketplace_service.ai_enhance_listing(payload)
    return APIResponse.respond(data=enhanced)
