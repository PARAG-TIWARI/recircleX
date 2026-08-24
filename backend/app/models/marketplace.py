from typing import Optional, List, Dict, Any
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class MarketplaceListing(BaseMongoModel):
    seller_id: str = Field(..., description="Collector / Seller user ID")
    inventory_id: str = Field(..., description="Referenced inventory item ID")
    material: str = Field(..., description="Material name e.g. PET Plastic, OCC Cardboard, Copper Scrap")
    category: str = Field(..., description="Plastic, Paper, Metal, E-Waste, Glass, Rubber")
    title: str = Field(..., description="Commercial listing title")
    description: Optional[str] = Field(default=None, description="Detailed technical/quality description")
    images: List[str] = Field(default_factory=list)
    quantity: float = Field(..., description="Available quantity")
    unit: str = Field(default="kg", description="kg, ton, units")
    quality: str = Field(default="Standard", description="Grade A, Grade B, Industrial Clean, Mixed")
    price_per_unit: float = Field(..., description="Wholesale price per unit in INR (₹/kg or ₹/ton)")
    location: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {"city": "Mumbai", "postal_code": "400001"},
        description="Warehouse dispatch location",
    )
    status: str = Field(
        default="ACTIVE",
        description="ACTIVE, RESERVED, SOLD, CANCELLED",
    )
