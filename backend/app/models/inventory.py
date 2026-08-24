from typing import Optional, List
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class Inventory(BaseMongoModel):
    collector_id: str = Field(..., description="Collector owner user ID")
    source_listing_id: Optional[str] = Field(default=None, description="Source household listing ID")
    pickup_id: Optional[str] = Field(default=None, description="Source pickup request ID")
    material: str = Field(..., description="Material name e.g. PET Plastic, Copper Wire")
    category: str = Field(..., description="Plastic, Metal, Paper, E-Waste, Glass")
    quantity: float = Field(default=0.0, description="Weight in kg or units")
    unit: str = Field(default="kg")
    quality: str = Field(default="Good", description="Good, Clean, Mixed, Fair")
    images: List[str] = Field(default_factory=list)
    estimated_value: Optional[float] = Field(default=None, description="Estimated value in INR")
    status: str = Field(
        default="AVAILABLE",
        description="AVAILABLE, LISTED, RESERVED, SOLD",
    )
