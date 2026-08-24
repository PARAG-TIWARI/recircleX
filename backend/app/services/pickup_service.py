from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from backend.app.models.pickup import PickupRequest
from backend.app.schemas.pickup import PickupCreate, PickupResponse
from backend.app.repositories.pickup_repository import pickup_repository
from backend.app.repositories.listing_repository import listing_repository
from backend.app.repositories.address_repository import address_repository


class PickupService:
    """Business logic for Pickup Requests and tracking."""

    async def create_pickup(self, user_id: str, data: PickupCreate) -> PickupResponse:
        listing = await listing_repository.get_by_id(data.listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Referenced listing not found")
        if listing.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized for this listing")
        if listing.status != "AVAILABLE":
            raise HTTPException(status_code=400, detail=f"Listing is not available for pickup (status: {listing.status})")

        # Snapshot address
        address_snapshot = data.address_snapshot
        if not address_snapshot and data.address_id:
            addr = await address_repository.get_by_id(data.address_id)
            if addr and addr.user_id == user_id:
                address_snapshot = addr.model_dump()
            elif addr:
                raise HTTPException(status_code=403, detail="Unauthorized address")

        pickup = PickupRequest(
            listing_id=listing.id,
            household_id=user_id,
            collector_id=None,
            address_id=data.address_id,
            address_snapshot=address_snapshot,
            preferred_time=data.preferred_time,
            status="REQUESTED",
            notes=data.notes,
        )
        created_pickup = await pickup_repository.create(pickup)

        # Transition listing status to PICKUP_REQUESTED
        await listing_repository.update(listing.id, {"status": "PICKUP_REQUESTED"})

        return PickupResponse(
            id=created_pickup.id,
            listing_id=created_pickup.listing_id,
            household_id=created_pickup.household_id,
            collector_id=created_pickup.collector_id,
            address_id=created_pickup.address_id,
            address_snapshot=created_pickup.address_snapshot,
            preferred_time=created_pickup.preferred_time,
            status=created_pickup.status,
            notes=created_pickup.notes,
            actual_weight=created_pickup.actual_weight,
            final_amount=created_pickup.final_amount,
            created_at=created_pickup.created_at,
            updated_at=created_pickup.updated_at,
            listing_title=listing.title,
            material=listing.material,
            category=listing.category,
            images=listing.images,
        )

    async def get_my_pickups(self, user_id: str, limit: int = 50, skip: int = 0) -> List[PickupResponse]:
        pickups = await pickup_repository.get_by_household(household_id=user_id, limit=limit, skip=skip)
        result = []
        for p in pickups:
            listing = await listing_repository.get_by_id(p.listing_id)
            result.append(
                PickupResponse(
                    id=p.id,
                    listing_id=p.listing_id,
                    household_id=p.household_id,
                    collector_id=p.collector_id,
                    address_id=p.address_id,
                    address_snapshot=p.address_snapshot,
                    preferred_time=p.preferred_time,
                    status=p.status,
                    notes=p.notes,
                    actual_weight=p.actual_weight,
                    final_amount=p.final_amount,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                    listing_title=listing.title if listing else "Recyclable Scrap",
                    material=listing.material if listing else "Scrap",
                    category=listing.category if listing else "General",
                    images=listing.images if listing else [],
                )
            )
        return result

    async def get_pickup(self, pickup_id: str, user_id: str) -> PickupResponse:
        pickup = await pickup_repository.get_by_id(pickup_id)
        if not pickup:
            raise HTTPException(status_code=404, detail="Pickup request not found")
        if pickup.household_id != user_id and pickup.collector_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized for this pickup")

        listing = await listing_repository.get_by_id(pickup.listing_id)
        return PickupResponse(
            id=pickup.id,
            listing_id=pickup.listing_id,
            household_id=pickup.household_id,
            collector_id=pickup.collector_id,
            address_id=pickup.address_id,
            address_snapshot=pickup.address_snapshot,
            preferred_time=pickup.preferred_time,
            status=pickup.status,
            notes=pickup.notes,
            actual_weight=pickup.actual_weight,
            final_amount=pickup.final_amount,
            created_at=pickup.created_at,
            updated_at=pickup.updated_at,
            listing_title=listing.title if listing else "Recyclable Scrap",
            material=listing.material if listing else "Scrap",
            category=listing.category if listing else "General",
            images=listing.images if listing else [],
        )


pickup_service = PickupService()
