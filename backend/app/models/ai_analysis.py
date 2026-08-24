from typing import Optional, Dict, Any
from pydantic import Field
from backend.app.models.base import BaseMongoModel


class AIAnalysis(BaseMongoModel):
    user_id: str = Field(..., description="User who requested analysis")
    analysis_type: str = Field(..., description="MATERIAL_IDENTIFICATION, LISTING_GENERATION, QUALITY_ASSESSMENT, ECOBOT_CHAT")
    image_url: Optional[str] = None
    input_prompt: Optional[str] = None
    result_data: Dict[str, Any] = Field(default_factory=dict)
    confidence_score: Optional[float] = None
    status: str = Field(default="COMPLETED", description="PENDING, COMPLETED, FAILED")
