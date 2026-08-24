from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class OrderResponse(BaseModel):
    id: str
    buyer_id: str
    seller_id: str
    marketplace_listing_id: str
    material: str
    category: str
    quantity: float
    unit: str
    unit_price: float
    total_amount: float
    quality: str
    status: str
    delivery_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    timeline: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None
    seller_service_area: Optional[str] = None


class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="CONFIRMED, PROCESSING, COMPLETED, CANCELLED")
    notes: Optional[str] = None
