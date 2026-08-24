from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    label: str = Field(default="Home", example="Home, Flat, Office")
    street_address: str = Field(..., example="402, Green Valley Apartments, MG Road")
    city: str = Field(default="Mumbai", example="Mumbai")
    state: str = Field(default="Maharashtra", example="Maharashtra")
    postal_code: str = Field(..., example="400001")
    landmark: Optional[str] = None
    contact_phone: Optional[str] = None
    is_default: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    landmark: Optional[str] = None
    contact_phone: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: str
    user_id: str
    label: str
    street_address: str
    city: str
    state: str
    postal_code: str
    landmark: Optional[str] = None
    contact_phone: Optional[str] = None
    is_default: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime
