from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from backend.app.core.security import get_current_user, require_role
from backend.app.models.user import UserRole, User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.collector import (
    CollectorDashboardStats,
    CollectorPickupResponse,
    CollectorPickupListResponse,
    CollectorInventoryResponse,
    CollectorInventoryListResponse,
    CollectorProfileResponse,
    CollectorProfileUpdate,
    CompletePickupRequest,
)
from backend.app.services.collector_service import collector_service

router = APIRouter(prefix="/collector", tags=["Collector Operations"])


@router.get("/dashboard", response_model=APIResponse[CollectorDashboardStats])
async def get_collector_dashboard(
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Get real dashboard metrics for the authenticated collector."""
    user_id = current_user.clerk_user_id or current_user.id
    stats = await collector_service.get_dashboard_stats(collector_id=user_id)
    return APIResponse.respond(data=stats)


@router.get("/pickups", response_model=APIResponse[CollectorPickupListResponse])
async def get_collector_pickups(
    tab: str = Query(default="available", description="available, assigned, completed"),
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Get pickup requests filtered by tab."""
    user_id = current_user.clerk_user_id or current_user.id
    items = await collector_service.get_pickups(collector_id=user_id, tab=tab, limit=limit, skip=skip)
    return APIResponse.respond(
        data=CollectorPickupListResponse(items=items, total=len(items))
    )


@router.get("/pickups/{pickup_id}", response_model=APIResponse[CollectorPickupResponse])
async def get_pickup_detail(
    pickup_id: str,
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Get full details of a specific pickup."""
    user_id = current_user.clerk_user_id or current_user.id
    detail = await collector_service.get_pickup_detail(pickup_id=pickup_id, collector_id=user_id)
    return APIResponse.respond(data=detail)


@router.post("/pickups/{pickup_id}/accept", response_model=APIResponse[CollectorPickupResponse])
async def accept_pickup(
    pickup_id: str,
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Accept an available pickup request and assign to current collector."""
    user_id = current_user.clerk_user_id or current_user.id
    updated = await collector_service.accept_pickup(pickup_id=pickup_id, collector_id=user_id)
    return APIResponse.respond(data=updated, message="Pickup accepted successfully")


@router.post("/pickups/{pickup_id}/start", response_model=APIResponse[CollectorPickupResponse])
async def start_pickup(
    pickup_id: str,
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Mark pickup as in progress / on the way to household location."""
    user_id = current_user.clerk_user_id or current_user.id
    updated = await collector_service.start_pickup(pickup_id=pickup_id, collector_id=user_id)
    return APIResponse.respond(data=updated, message="Pickup started. Partner is on the way.")


@router.post("/pickups/{pickup_id}/complete", response_model=APIResponse[CollectorPickupResponse])
async def complete_pickup(
    pickup_id: str,
    payload: CompletePickupRequest,
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Mark pickup as collected, intake weight, and create inventory item."""
    user_id = current_user.clerk_user_id or current_user.id
    updated = await collector_service.complete_pickup(
        pickup_id=pickup_id, collector_id=user_id, payload=payload
    )
    return APIResponse.respond(data=updated, message="Pickup completed. Inventory item created.")


@router.get("/inventory", response_model=APIResponse[CollectorInventoryListResponse])
async def get_collector_inventory(
    limit: int = Query(default=100, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Get warehouse inventory belonging to the authenticated collector."""
    user_id = current_user.clerk_user_id or current_user.id
    inv = await collector_service.get_inventory(collector_id=user_id, limit=limit, skip=skip)
    return APIResponse.respond(data=inv)


@router.get("/inventory/{inventory_id}", response_model=APIResponse[CollectorInventoryResponse])
async def get_inventory_item(
    inventory_id: str,
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Get details of a specific collected inventory item."""
    user_id = current_user.clerk_user_id or current_user.id
    item = await collector_service.get_inventory_item(inventory_id=inventory_id, collector_id=user_id)
    return APIResponse.respond(data=item)


@router.get("/profile", response_model=APIResponse[CollectorProfileResponse])
async def get_collector_profile(
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Get profile information for the authenticated collector."""
    user_id = current_user.clerk_user_id or current_user.id
    prof = await collector_service.get_profile(collector_id=user_id)
    return APIResponse.respond(data=prof)


@router.patch("/profile", response_model=APIResponse[CollectorProfileResponse])
async def update_collector_profile(
    payload: CollectorProfileUpdate,
    current_user: User = Depends(require_role(UserRole.COLLECTOR, UserRole.ADMIN)),
):
    """Update profile information for the authenticated collector."""
    user_id = current_user.clerk_user_id or current_user.id
    updated = await collector_service.update_profile(collector_id=user_id, data=payload)
    return APIResponse.respond(data=updated, message="Collector profile updated")
