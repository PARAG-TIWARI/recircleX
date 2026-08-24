from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from backend.app.models.user import UserRole


class AuthSyncRequest(BaseModel):
    clerk_user_id: str = Field(..., description="Clerk user ID")
    email: Optional[EmailStr] = Field(default=None, description="User email from Clerk")
    role: UserRole = Field(default=UserRole.HOUSEHOLD, description="Selected initial role")
    portal: str = Field(default="INDIVIDUAL", description="INDIVIDUAL or BUSINESS")
    name: Optional[str] = Field(default=None, description="Full name or business name")
    company_name: Optional[str] = Field(default=None, description="Company name if business portal")
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
