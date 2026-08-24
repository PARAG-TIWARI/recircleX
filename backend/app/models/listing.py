from typing import Optional, List, Dict, Any
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class Listing(BaseMongoModel):
    owner_id: str = Field(..., description="Household or Enterprise user ID")
    material: str = Field(..., description="e.g. PET Plastic, Copper, Cardboard")
    category: str = Field(..., description="Plastic, Metal, Paper, E-Waste, Glass, Industrial")
    title: str = Field(..., description="Generated or edited listing title")
    description: Optional[str] = Field(default=None, description="Listing description")
    images: List[str] = Field(default_factory=list, description="Cloudinary CDN image URLs")
    quantity: float = Field(default=1.0, description="Estimated quantity or weight")
    unit: str = Field(default="kg", description="kg, tonnes, pieces")
    quality: str = Field(default="Good", description="Grade A, Clean, Mixed, Good, Fair")
    ai_analysis_id: Optional[str] = Field(default=None, description="Reference to AI analysis run")
    estimated_price: Optional[float] = Field(default=None, description="Estimated price in INR")
    estimated_price_range: Optional[str] = Field(default=None, description="e.g. ₹180 - ₹220")
    location: Optional[Dict[str, Any]] = Field(default=None, description="City, address, coordinates")
    status: str = Field(
        default="AVAILABLE",
        description="AVAILABLE, PICKUP_REQUESTED, SCHEDULED, COLLECTED, CANCELLED",
    )
