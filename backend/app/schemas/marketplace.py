from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MarketplaceListingCreate(BaseModel):
    inventory_id: str = Field(..., description="Inventory item ID to list on marketplace")
    title: str = Field(..., description="Commercial title for listing")
    description: Optional[str] = None
    price_per_unit: float = Field(..., gt=0, description="Price per unit in INR (₹/kg)")
    quality: str = Field(default="Standard", description="Grade A, Grade B, Industrial Clean")
    location: Optional[Dict[str, Any]] = None


class MarketplaceListingResponse(BaseModel):
    id: str
    seller_id: str
    inventory_id: str
    material: str
    category: str
    title: str
    description: Optional[str] = None
    images: List[str] = []
    quantity: float
    unit: str
    quality: str
    price_per_unit: float
    total_value: float
    location: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    updated_at: datetime
    seller_name: Optional[str] = None
    seller_is_verified: bool = False
    seller_rating: float = 4.9
    seller_service_area: Optional[str] = None
    estimated_co2_kg: float = 0.0


class MarketplaceListingListResponse(BaseModel):
    items: List[MarketplaceListingResponse]
    total: int


class ReserveListingRequest(BaseModel):
    delivery_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class AIListingEnhanceRequest(BaseModel):
    material: str
    quantity: float
    unit: str = "kg"
    quality: str = "Standard"
    category: Optional[str] = None


class AIListingEnhanceResponse(BaseModel):
    enhanced_title: str
    technical_description: str
    quality_summary: str
    suggested_price_per_unit: float
