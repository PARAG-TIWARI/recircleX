from typing import Optional
from fastapi import APIRouter, Depends
from backend.app.core.security import get_optional_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.ai import (
    MaterialAnalyzeRequest,
    MaterialAnalyzeResponse,
    ListingGenerateRequest,
    ListingGenerateResponse,
    EcoBotRequest,
    EcoBotResponse,
)
from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Services"])


@router.post("/analyze-material", response_model=APIResponse[MaterialAnalyzeResponse])
async def analyze_material(
    payload: MaterialAnalyzeRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Analyze an uploaded scrap image and detect recyclable material type."""
    result = await ai_service.identify_material(image_url=payload.image_url)
    return APIResponse.respond(
        data=MaterialAnalyzeResponse(**result),
        message="AI material identification complete",
    )


@router.post("/generate-listing", response_model=APIResponse[ListingGenerateResponse])
async def generate_listing_content(
    payload: ListingGenerateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Generate listing title, description, and price estimation from detected material."""
    result = await ai_service.generate_listing(
        material=payload.material,
        category=payload.category,
        quality=payload.quality,
        quantity=payload.quantity,
        unit=payload.unit,
    )
    return APIResponse.respond(
        data=ListingGenerateResponse(**result),
        message="Listing generated",
    )


@router.post("/ecobot", response_model=APIResponse[EcoBotResponse])
async def query_ecobot(
    payload: EcoBotRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Ask EcoBot questions about recycling, disposal methods, and pickup procedures."""
    result = await ai_service.query_ecobot(query=payload.query, history=payload.history)
    return APIResponse.respond(
        data=EcoBotResponse(**result),
        message="EcoBot response generated",
    )
