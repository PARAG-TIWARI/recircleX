from typing import List, Dict, Any
from pydantic import BaseModel


class CategoryImpactItem(BaseModel):
    category: str
    weight_kg: float
    percentage: float
    co2_saved_kg: float


class HouseholdImpactResponse(BaseModel):
    total_material_recycled_kg: float
    total_pickups_completed: int
    active_listings_count: int
    estimated_earnings_inr: float
    estimated_co2_offset_kg: float
    trees_equivalent: float
    landfill_diverted_kg: float
    categories: List[CategoryImpactItem]
