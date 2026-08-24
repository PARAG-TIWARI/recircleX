from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from backend.app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    clerk_user_id: str
    email: Optional[EmailStr] = None
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserRead(BaseModel):
    id: Optional[str] = None
    clerk_user_id: str
    email: Optional[str] = None
    role: UserRole
    status: UserStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
