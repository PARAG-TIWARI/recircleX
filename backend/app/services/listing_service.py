from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from backend.app.models.listing import Listing
from backend.app.schemas.listing import ListingCreate, ListingUpdate
from backend.app.repositories.listing_repository import listing_repository
from backend.app.services.ai_service import MATERIAL_RATES


class ListingService:
    """Business logic for Waste Listings."""

    async def create_listing(self, user_id: str, data: ListingCreate) -> Listing:
        # Calculate estimated price if not explicitly provided
        rate = MATERIAL_RATES.get(data.material, {}).get("rate", 30.0)
        est_price = data.estimated_price or (rate * data.quantity)
        min_p = round(est_price * 0.9)
        max_p = round(est_price * 1.15)
        price_range = data.estimated_price_range or f"₹{min_p} – ₹{max_p}"

        listing = Listing(
            owner_id=user_id,
            material=data.material,
            category=data.category,
            title=data.title,
            description=data.description,
            images=data.images,
            quantity=data.quantity,
            unit=data.unit,
            quality=data.quality,
            ai_analysis_id=data.ai_analysis_id,
            estimated_price=est_price,
            estimated_price_range=price_range,
            location=data.location,
            status="AVAILABLE",
        )
        return await listing_repository.create(listing)

    async def get_my_listings(self, user_id: str, limit: int = 50, skip: int = 0) -> List[Listing]:
        return await listing_repository.get_by_owner(owner_id=user_id, limit=limit, skip=skip)

    async def get_my_listings_count(self, user_id: str) -> int:
        return await listing_repository.count_by_owner(owner_id=user_id)

    async def get_listing(self, listing_id: str, user_id: str) -> Listing:
        listing = await listing_repository.get_by_id(listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        # Ensure owner authorization
        if listing.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this listing")
        return listing

    async def update_listing(self, listing_id: str, user_id: str, data: ListingUpdate) -> Listing:
        listing = await self.get_listing(listing_id, user_id)
        update_dict = data.model_dump(exclude_unset=True)
        if update_dict:
            updated = await listing_repository.update(listing_id, update_dict)
            if updated:
                return updated
        return listing

    async def delete_listing(self, listing_id: str, user_id: str) -> bool:
        await self.get_listing(listing_id, user_id)
        return await listing_repository.delete(listing_id)


listing_service = ListingService()
