from enum import Enum
from typing import Optional
from pydantic import EmailStr, Field
from backend.app.models.base import BaseMongoModel


class UserRole(str, Enum):
    HOUSEHOLD = "HOUSEHOLD"
    COLLECTOR = "COLLECTOR"
    RECYCLER = "RECYCLER"
    ENTERPRISE = "ENTERPRISE"
    ADMIN = "ADMIN"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    SUSPENDED = "SUSPENDED"


class User(BaseMongoModel):
    clerk_user_id: str = Field(..., description="Unique Clerk User ID (e.g. user_xxx)")
    email: Optional[EmailStr] = Field(default=None, description="Primary email address")
    role: UserRole = Field(default=UserRole.HOUSEHOLD, description="Assigned platform role")
    status: UserStatus = Field(default=UserStatus.ACTIVE, description="Account status")
