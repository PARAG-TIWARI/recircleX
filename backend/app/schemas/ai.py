from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MaterialAnalyzeRequest(BaseModel):
    image_url: str = Field(..., description="Cloudinary CDN image URL to analyze")


class MaterialAnalyzeResponse(BaseModel):
    material: str = Field(..., json_schema_extra={"example": "PET Plastic"})
    category: str = Field(..., json_schema_extra={"example": "Plastic"})
    confidence: float = Field(..., json_schema_extra={"example": 0.94})
    quality: str = Field(..., json_schema_extra={"example": "Good"})
    recyclable: bool = Field(default=True)
    estimated_price_per_kg: float = Field(default=34.0)
    tips: Optional[str] = Field(default=None)


class ListingGenerateRequest(BaseModel):
    material: str = Field(..., json_schema_extra={"example": "PET Plastic"})
    category: str = Field(..., json_schema_extra={"example": "Plastic"})
    quality: str = Field(default="Good")
    quantity: float = Field(default=5.0)
    unit: str = Field(default="kg")


class ListingGenerateResponse(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Clean PET Plastic Bottles"})
    description: str = Field(..., json_schema_extra={"example": "Clean household PET bottles suitable for recycling collection."})
    category: str
    material: str
    quality: str
    estimated_price_min: float
    estimated_price_max: float
    estimated_price_display: str = Field(..., json_schema_extra={"example": "₹170 – ₹220"})


class EcoBotRequest(BaseModel):
    query: str = Field(..., json_schema_extra={"example": "Is glossy cardboard recyclable?"})
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list)


class EcoBotResponse(BaseModel):
    answer: str
    suggestions: List[str] = []
