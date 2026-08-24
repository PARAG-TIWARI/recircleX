from typing import Optional, Dict, Any
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class Profile(BaseMongoModel):
    user_id: str = Field(..., description="Internal User ID reference or Clerk User ID")
    name: Optional[str] = Field(default=None, description="Full name or display name")
    phone: Optional[str] = Field(default=None, description="Contact phone number")
    avatar_url: Optional[str] = Field(default=None, description="Avatar image URL (Cloudinary or Clerk)")
    company_name: Optional[str] = Field(default=None, description="Company / business entity name if applicable")
    service_area: Optional[str] = Field(default="Metro Zone 1", description="Service sector or region")
    is_verified: bool = Field(default=False, description="Verified partner flag")
    rating: float = Field(default=4.9, description="Collector rating out of 5.0")
    total_pickups: int = Field(default=0, description="Count of completed pickups")
    location: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Location details (city, state, postal_code, lat, lng)",
    )
