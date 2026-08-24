from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.order import OrderResponse, OrderListResponse, OrderStatusUpdate
from backend.app.services.order_service import order_service

router = APIRouter(prefix="/orders", tags=["B2B Orders"])


@router.get("", response_model=APIResponse[OrderListResponse])
async def get_my_orders(
    as_seller: bool = Query(default=False, description="Filter as seller/collector instead of buyer"),
    status_filter: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
):
    """Get procurement orders where current user is buyer or seller."""
    user_id = current_user.clerk_user_id or current_user.id
    orders = await order_service.get_orders(
        user_id=user_id,
        as_seller=as_seller,
        status_filter=status_filter,
        limit=limit,
        skip=skip,
    )
    return APIResponse.respond(data=orders)


@router.get("/{order_id}", response_model=APIResponse[OrderResponse])
async def get_order_detail(
    order_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get full details of a specific B2B contract order."""
    user_id = current_user.clerk_user_id or current_user.id
    order = await order_service.get_order_detail(order_id=order_id, user_id=user_id)
    return APIResponse.respond(data=order)


@router.patch("/{order_id}/status", response_model=APIResponse[OrderResponse])
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update order status (e.g. PROCESSING, COMPLETED, CANCELLED)."""
    user_id = current_user.clerk_user_id or current_user.id
    updated = await order_service.update_order_status(
        order_id=order_id, user_id=user_id, payload=payload
    )
    return APIResponse.respond(data=updated, message=f"Order status updated to {payload.status}")
