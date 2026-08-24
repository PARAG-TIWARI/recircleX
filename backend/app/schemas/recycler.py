from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class RecyclerDashboardStats(BaseModel):
    available_marketplace_lots_count: int
    active_orders_count: int
    pending_reservations_count: int
    total_purchased_kg: float
    total_spend_inr: float
    estimated_co2_offset_kg: float
    waste_diverted_kg: float


class SupplierResponse(BaseModel):
    id: str
    user_id: str
    name: str
    company_name: Optional[str] = None
    service_area: str
    is_verified: bool
    rating: float
    total_pickups: int
    phone: Optional[str] = None
    materials_supplied: List[str] = []


class SupplierListResponse(BaseModel):
    items: List[SupplierResponse]
    total: int


class RecyclerProfileResponse(BaseModel):
    user_id: str
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    preferred_materials: List[str] = []
    daily_procurement_capacity_tons: float = 5.0


class RecyclerProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    preferred_materials: Optional[List[str]] = None
    daily_procurement_capacity_tons: Optional[float] = None
