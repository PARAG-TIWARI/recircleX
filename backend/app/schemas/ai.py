from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MaterialAnalyzeRequest(BaseModel):
    image_url: str = Field(..., description="Cloudinary CDN image URL to analyze")


class MaterialAnalyzeResponse(BaseModel):
    material: str = Field(..., example="PET Plastic")
    category: str = Field(..., example="Plastic")
    confidence: float = Field(..., example=0.94)
    quality: str = Field(..., example="Good")
    recyclable: bool = Field(default=True)
    estimated_price_per_kg: float = Field(default=34.0)
    tips: Optional[str] = Field(default=None)


class ListingGenerateRequest(BaseModel):
    material: str = Field(..., example="PET Plastic")
    category: str = Field(..., example="Plastic")
    quality: str = Field(default="Good")
    quantity: float = Field(default=5.0)
    unit: str = Field(default="kg")


class ListingGenerateResponse(BaseModel):
    title: str = Field(..., example="Clean PET Plastic Bottles")
    description: str = Field(..., example="Clean household PET bottles suitable for recycling collection.")
    category: str
    material: str
    quality: str
    estimated_price_min: float
    estimated_price_max: float
    estimated_price_display: str = Field(..., example="₹170 – ₹220")


class EcoBotRequest(BaseModel):
    query: str = Field(..., example="Is glossy cardboard recyclable?")
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list)


class EcoBotResponse(BaseModel):
    answer: str
    suggestions: List[str] = []
