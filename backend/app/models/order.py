from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class OrderTimelineItem(BaseMongoModel):
    title: str
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str


class Order(BaseMongoModel):
    buyer_id: str = Field(..., description="Recycler / Enterprise buyer user ID")
    seller_id: str = Field(..., description="Collector / Supplier seller user ID")
    marketplace_listing_id: str = Field(..., description="Referenced Marketplace Listing ID")
    material: str = Field(..., description="Material name e.g. PET Plastic")
    category: str = Field(..., description="Plastic, Metal, Paper, etc.")
    quantity: float = Field(..., description="Purchased quantity")
    unit: str = Field(default="kg")
    unit_price: float = Field(..., description="Price per unit in INR")
    total_amount: float = Field(..., description="Total contract amount in INR")
    quality: str = Field(default="Standard")
    status: str = Field(
        default="CONFIRMED",
        description="PENDING, CONFIRMED, PROCESSING, COMPLETED, CANCELLED",
    )
    delivery_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
