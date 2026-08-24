from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class PickupCreate(BaseModel):
    listing_id: str = Field(..., description="ID of the listing to pick up")
    address_id: Optional[str] = Field(default=None)
    address_snapshot: Optional[Dict[str, Any]] = None
    preferred_time: str = Field(..., json_schema_extra={"example": "Today 2:00 PM - 4:00 PM"})
    notes: Optional[str] = None


class PickupResponse(BaseModel):
    id: str
    listing_id: str
    household_id: str
    collector_id: Optional[str] = None
    address_id: Optional[str] = None
    address_snapshot: Optional[Dict[str, Any]] = None
    preferred_time: str
    status: str
    notes: Optional[str] = None
    actual_weight: Optional[float] = None
    final_amount: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    listing_title: Optional[str] = None
    material: Optional[str] = None
    category: Optional[str] = None
    images: List[str] = []


class PickupListResponse(BaseModel):
    items: List[PickupResponse]
    total: int
