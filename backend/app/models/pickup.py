from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class PickupRequest(BaseMongoModel):
    listing_id: str = Field(..., description="Referenced Listing ID")
    household_id: str = Field(..., description="Household user ID creating the pickup")
    collector_id: Optional[str] = Field(default=None, description="Assigned Collector user ID")
    address_id: Optional[str] = Field(default=None, description="Saved address ID")
    address_snapshot: Optional[Dict[str, Any]] = Field(
        default=None, description="Static copy of pickup address and contact info"
    )
    preferred_time: str = Field(..., description="Selected time slot e.g. Today 2:00 PM - 4:00 PM")
    status: str = Field(
        default="REQUESTED",
        description="REQUESTED, ASSIGNED, ON_THE_WAY, COLLECTED, CANCELLED",
    )
    notes: Optional[str] = Field(default=None, description="Pickup instructions for collector")
    actual_weight: Optional[float] = Field(default=None, description="Weighed weight in kg upon intake")
    final_amount: Optional[float] = Field(default=None, description="Final settlement amount in INR")
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
