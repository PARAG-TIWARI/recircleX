from typing import Optional
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class Address(BaseMongoModel):
    user_id: str = Field(..., description="User ID reference")
    label: str = Field(default="Home", description="Label e.g. Home, Apartment, Office")
    street_address: str = Field(..., description="Street address, building, house no")
    city: str = Field(default="Mumbai")
    state: str = Field(default="Maharashtra")
    postal_code: str = Field(...)
    country: str = Field(default="India")
    landmark: Optional[str] = None
    contact_phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = Field(default=False)
