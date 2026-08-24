from typing import List
from fastapi import APIRouter, Depends, Query, status
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.notification import NotificationResponse, NotificationListResponse
from backend.app.repositories.notification_repository import notification_repository

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=APIResponse[NotificationListResponse])
async def get_my_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """Get in-app notifications for the authenticated user."""
    user_id = current_user.clerk_user_id or current_user.id
    items = await notification_repository.get_by_user(user_id=user_id, limit=limit)
    unread_count = await notification_repository.count_unread(user_id=user_id)
    return APIResponse.respond(
        data=NotificationListResponse(
            items=[NotificationResponse(**i.model_dump()) for i in items],
            unread_count=unread_count,
        )
    )


@router.patch("/{notification_id}/read", response_model=APIResponse[bool])
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    user_id = current_user.clerk_user_id or current_user.id
    success = await notification_repository.mark_read(notification_id=notification_id, user_id=user_id)
    return APIResponse.respond(data=success, message="Notification marked as read")
