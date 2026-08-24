from typing import Optional
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class Notification(BaseMongoModel):
    user_id: str = Field(..., description="Recipient user ID")
    title: str
    message: str
    type: str = Field(default="INFO", description="INFO, SUCCESS, WARNING, ORDER, PICKUP")
    is_read: bool = Field(default=False)
    action_url: Optional[str] = None
