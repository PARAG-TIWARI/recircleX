from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ListingCreate(BaseModel):
    material: str = Field(..., json_schema_extra={"example": "PET Plastic"})
    category: str = Field(..., json_schema_extra={"example": "Plastic"})
    title: str = Field(..., json_schema_extra={"example": "PET Plastic Bottles"})
    description: Optional[str] = Field(default=None, json_schema_extra={"example": "Clean household PET bottles ready for recycling"})
    images: List[str] = Field(default_factory=list)
    quantity: float = Field(default=1.0, ge=0.1)
    unit: str = Field(default="kg")
    quality: str = Field(default="Good")
    ai_analysis_id: Optional[str] = None
    estimated_price: Optional[float] = None
    estimated_price_range: Optional[str] = None
    location: Optional[Dict[str, Any]] = None


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    quality: Optional[str] = None
    status: Optional[str] = None
    location: Optional[Dict[str, Any]] = None


class ListingResponse(BaseModel):
    id: str
    owner_id: str
    material: str
    category: str
    title: str
    description: Optional[str] = None
    images: List[str] = []
    quantity: float
    unit: str
    quality: str
    ai_analysis_id: Optional[str] = None
    estimated_price: Optional[float] = None
    estimated_price_range: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    updated_at: datetime


class ListingListResponse(BaseModel):
    items: List[ListingResponse]
    total: int
