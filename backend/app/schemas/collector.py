from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class CollectorDashboardStats(BaseModel):
    new_pickup_requests_count: int
    todays_pickups_count: int
    active_pickup_count: int
    completed_pickups_count: int
    current_inventory_kg: float
    estimated_inventory_value_inr: float


class CollectorPickupResponse(BaseModel):
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
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    listing_title: Optional[str] = None
    material: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    estimated_price_range: Optional[str] = None
    images: List[str] = []
    location_area: Optional[str] = None


class CollectorPickupListResponse(BaseModel):
    items: List[CollectorPickupResponse]
    total: int


class CompletePickupRequest(BaseModel):
    actual_weight: Optional[float] = Field(default=None, description="Actual scale weight in kg")
    final_amount: Optional[float] = Field(default=None, description="Actual settlement amount in INR")
    notes: Optional[str] = None


class CollectorInventoryResponse(BaseModel):
    id: str
    collector_id: str
    source_listing_id: Optional[str] = None
    pickup_id: Optional[str] = None
    material: str
    category: str
    quantity: float
    unit: str
    quality: str
    images: List[str] = []
    estimated_value: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: datetime


class CollectorInventoryListResponse(BaseModel):
    items: List[CollectorInventoryResponse]
    total: int
    total_weight_kg: float
    total_estimated_value: float


class CollectorProfileResponse(BaseModel):
    user_id: str
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    service_area: Optional[str] = None
    is_verified: bool = False
    rating: float = 4.9
    total_pickups: int = 0
    location: Optional[Dict[str, Any]] = None


class CollectorProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    service_area: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
