from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from backend.app.core.security import get_current_user, require_role
from backend.app.models.user import User, UserRole
from backend.app.schemas.common import APIResponse
from backend.app.schemas.recycler import (
    RecyclerDashboardStats,
    SupplierListResponse,
    RecyclerProfileResponse,
    RecyclerProfileUpdate,
)
from backend.app.services.recycler_service import recycler_service

router = APIRouter(prefix="/recycler", tags=["Recycler Operations"])


@router.get("/dashboard", response_model=APIResponse[RecyclerDashboardStats])
async def get_recycler_dashboard(
    current_user: User = Depends(require_role(UserRole.RECYCLER, UserRole.ENTERPRISE, UserRole.ADMIN)),
):
    """Get real dashboard metrics for the authenticated recycler plant."""
    user_id = current_user.clerk_user_id or current_user.id
    stats = await recycler_service.get_dashboard_stats(recycler_id=user_id)
    return APIResponse.respond(data=stats)


@router.get("/suppliers", response_model=APIResponse[SupplierListResponse])
async def get_verified_suppliers(
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: User = Depends(require_role(UserRole.RECYCLER, UserRole.ENTERPRISE, UserRole.ADMIN)),
):
    """Get directory of verified collection hub partners."""
    suppliers = await recycler_service.get_suppliers(limit=limit, skip=skip)
    return APIResponse.respond(data=suppliers)


@router.get("/profile", response_model=APIResponse[RecyclerProfileResponse])
async def get_recycler_profile(
    current_user: User = Depends(require_role(UserRole.RECYCLER, UserRole.ENTERPRISE, UserRole.ADMIN)),
):
    """Get profile information for the authenticated recycler."""
    user_id = current_user.clerk_user_id or current_user.id
    prof = await recycler_service.get_profile(recycler_id=user_id)
    return APIResponse.respond(data=prof)


@router.patch("/profile", response_model=APIResponse[RecyclerProfileResponse])
async def update_recycler_profile(
    payload: RecyclerProfileUpdate,
    current_user: User = Depends(require_role(UserRole.RECYCLER, UserRole.ENTERPRISE, UserRole.ADMIN)),
):
    """Update profile information for the authenticated recycler."""
    user_id = current_user.clerk_user_id or current_user.id
    updated = await recycler_service.update_profile(recycler_id=user_id, payload=payload)
    return APIResponse.respond(data=updated, message="Recycler profile updated successfully")
