from typing import Optional
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class Material(BaseMongoModel):
    name: str = Field(..., description="e.g. PET Plastic, Aluminium Cans, E-Waste")
    code: str = Field(..., description="Unique slug or recycling code e.g. PET_PLASTIC")
    category: str = Field(default="Plastic", description="Plastic, Metal, Paper, Glass, E-Waste, Organic")
    unit: str = Field(default="kg", description="Unit of measurement (kg, tonne, units)")
    standard_rate: float = Field(default=0.0, description="Base market rate per unit")
    co2_offset_factor: float = Field(default=0.0, description="kg CO2 saved per unit recycled")
    description: Optional[str] = None
