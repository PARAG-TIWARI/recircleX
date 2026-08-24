from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from backend.app.models.pickup import PickupRequest
from backend.app.models.inventory import Inventory
from backend.app.models.notification import Notification
from backend.app.models.profile import Profile
from backend.app.schemas.collector import (
    CollectorDashboardStats,
    CollectorPickupResponse,
    CollectorInventoryResponse,
    CollectorInventoryListResponse,
    CollectorProfileResponse,
    CollectorProfileUpdate,
    CompletePickupRequest,
)
from backend.app.repositories.pickup_repository import pickup_repository
from backend.app.repositories.listing_repository import listing_repository
from backend.app.repositories.inventory_repository import inventory_repository
from backend.app.repositories.notification_repository import notification_repository
from backend.app.repositories.profile_repository import ProfileRepository
from backend.app.db.mongodb import get_database


class CollectorService:
    """Service handling all collector workflows and state machine validation."""

    def _get_profile_repo(self) -> ProfileRepository:
        return ProfileRepository(get_database())

    async def get_dashboard_stats(self, collector_id: str) -> CollectorDashboardStats:
        new_requests = await pickup_repository.count_available_requests()
        assigned_count = await pickup_repository.count_by_collector(collector_id, "ASSIGNED")
        active_count = await pickup_repository.count_by_collector(collector_id, "ON_THE_WAY")
        completed_count = await pickup_repository.count_by_collector(collector_id, "COLLECTED")
        total_kg, total_val = await inventory_repository.get_total_weight_and_value(collector_id)

        return CollectorDashboardStats(
            new_pickup_requests_count=new_requests,
            todays_pickups_count=assigned_count + active_count,
            active_pickup_count=active_count,
            completed_pickups_count=completed_count,
            current_inventory_kg=round(total_kg, 1),
            estimated_inventory_value_inr=round(total_val, 2),
        )

    async def get_pickups(
        self, collector_id: str, tab: str = "available", limit: int = 50, skip: int = 0
    ) -> List[CollectorPickupResponse]:
        if tab == "available":
            pickups = await pickup_repository.get_available_requests(limit=limit, skip=skip)
        elif tab == "assigned":
            cursor_assigned = await pickup_repository.get_by_collector(collector_id, "ASSIGNED", limit=limit, skip=skip)
            cursor_ontheway = await pickup_repository.get_by_collector(collector_id, "ON_THE_WAY", limit=limit, skip=skip)
            pickups = cursor_ontheway + cursor_assigned
        elif tab == "completed":
            pickups = await pickup_repository.get_by_collector(collector_id, "COLLECTED", limit=limit, skip=skip)
        else:
            pickups = await pickup_repository.get_available_requests(limit=limit, skip=skip)

        results = []
        for p in pickups:
            listing = await listing_repository.get_by_id(p.listing_id)
            addr = p.address_snapshot or {}
            loc_area = f"{addr.get('city', 'Metro Area')}, {addr.get('postal_code', '')}"

            results.append(
                CollectorPickupResponse(
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
                    assigned_at=p.assigned_at,
                    started_at=p.started_at,
                    completed_at=p.completed_at,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                    listing_title=listing.title if listing else "Recyclable Lot",
                    material=listing.material if listing else "Scrap",
                    category=listing.category if listing else "General",
                    quantity=listing.quantity if listing else 1.0,
                    unit=listing.unit if listing else "kg",
                    estimated_price_range=listing.estimated_price_range if listing else "₹180–₹220",
                    images=listing.images if listing else [],
                    location_area=loc_area,
                )
            )
        return results

    async def get_pickup_detail(self, pickup_id: str, collector_id: str) -> CollectorPickupResponse:
        p = await pickup_repository.get_by_id(pickup_id)
        if not p:
            raise HTTPException(status_code=404, detail="Pickup request not found")

        # Allow if available or assigned to this collector
        if p.status != "REQUESTED" and p.collector_id != collector_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this pickup")

        listing = await listing_repository.get_by_id(p.listing_id)
        addr = p.address_snapshot or {}
        loc_area = f"{addr.get('street_address', '')}, {addr.get('city', '')} {addr.get('postal_code', '')}"

        return CollectorPickupResponse(
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
            assigned_at=p.assigned_at,
            started_at=p.started_at,
            completed_at=p.completed_at,
            created_at=p.created_at,
            updated_at=p.updated_at,
            listing_title=listing.title if listing else "Recyclable Lot",
            material=listing.material if listing else "Scrap",
            category=listing.category if listing else "General",
            quantity=listing.quantity if listing else 1.0,
            unit=listing.unit if listing else "kg",
            estimated_price_range=listing.estimated_price_range if listing else "₹180–₹220",
            images=listing.images if listing else [],
            location_area=loc_area,
        )

    async def accept_pickup(self, pickup_id: str, collector_id: str) -> CollectorPickupResponse:
        p = await pickup_repository.get_by_id(pickup_id)
        if not p:
            raise HTTPException(status_code=404, detail="Pickup not found")
        if p.status != "REQUESTED":
            raise HTTPException(
                status_code=400, detail=f"Cannot accept pickup in status '{p.status}' (must be REQUESTED)"
            )

        now = datetime.utcnow()
        await pickup_repository.update(
            pickup_id,
            {
                "collector_id": collector_id,
                "status": "ASSIGNED",
                "assigned_at": now,
            },
        )

        # Notify Household
        prof = await self._get_profile_repo().get_by_user_id(collector_id)
        collector_name = prof.name if prof and prof.name else "Certified Collection Partner"
        await notification_repository.create(
            Notification(
                user_id=p.household_id,
                title="Collector Assigned",
                message=f"{collector_name} has accepted your scrap pickup request.",
                type="PICKUP",
                action_url="/individual/household/pickups",
            )
        )

        return await self.get_pickup_detail(pickup_id, collector_id)

    async def start_pickup(self, pickup_id: str, collector_id: str) -> CollectorPickupResponse:
        p = await pickup_repository.get_by_id(pickup_id)
        if not p:
            raise HTTPException(status_code=404, detail="Pickup not found")
        if p.collector_id != collector_id:
            raise HTTPException(status_code=403, detail="Not authorized for this pickup")
        if p.status != "ASSIGNED":
            raise HTTPException(
                status_code=400, detail=f"Cannot start pickup in status '{p.status}' (must be ASSIGNED)"
            )

        now = datetime.utcnow()
        await pickup_repository.update(
            pickup_id,
            {
                "status": "ON_THE_WAY",
                "started_at": now,
            },
        )

        # Notify Household
        await notification_repository.create(
            Notification(
                user_id=p.household_id,
                title="Collector On The Way",
                message="Your collection partner is en route with a certified digital scale.",
                type="PICKUP",
                action_url="/individual/household/pickups",
            )
        )

        return await self.get_pickup_detail(pickup_id, collector_id)

    async def complete_pickup(
        self, pickup_id: str, collector_id: str, payload: CompletePickupRequest
    ) -> CollectorPickupResponse:
        p = await pickup_repository.get_by_id(pickup_id)
        if not p:
            raise HTTPException(status_code=404, detail="Pickup not found")
        if p.collector_id != collector_id:
            raise HTTPException(status_code=403, detail="Not authorized for this pickup")
        if p.status not in ("ON_THE_WAY", "ASSIGNED"):
            raise HTTPException(
                status_code=400, detail=f"Cannot complete pickup in status '{p.status}'"
            )

        listing = await listing_repository.get_by_id(p.listing_id)
        weight = payload.actual_weight or (listing.quantity if listing else 5.0)
        amount = payload.final_amount or (listing.estimated_price if listing else 180.0)
        now = datetime.utcnow()

        # 1. Update Pickup
        await pickup_repository.update(
            pickup_id,
            {
                "status": "COLLECTED",
                "actual_weight": weight,
                "final_amount": amount,
                "notes": payload.notes or p.notes,
                "completed_at": now,
            },
        )

        # 2. Update Listing
        if listing:
            await listing_repository.update(listing.id, {"status": "COLLECTED"})

        # 3. Create Inventory Record for Collector
        await inventory_repository.create(
            Inventory(
                collector_id=collector_id,
                source_listing_id=p.listing_id,
                pickup_id=p.id,
                material=listing.material if listing else "PET Plastic",
                category=listing.category if listing else "Plastic",
                quantity=weight,
                unit=listing.unit if listing else "kg",
                quality=listing.quality if listing else "Good",
                images=listing.images if listing else [],
                estimated_value=amount,
                status="AVAILABLE",
            )
        )

        # 4. Update Collector Profile Stats
        prof_repo = self._get_profile_repo()
        prof = await prof_repo.get_by_user_id(collector_id)
        if prof:
            await prof_repo.update(prof.id, {"total_pickups": prof.total_pickups + 1})

        # 5. Notify Household
        await notification_repository.create(
            Notification(
                user_id=p.household_id,
                title="Material Collected",
                message=f"Pickup completed! {weight} kg of {listing.material if listing else 'scrap'} collected. Instant settlement recorded.",
                type="SUCCESS",
                action_url="/individual/household/impact",
            )
        )

        return await self.get_pickup_detail(pickup_id, collector_id)

    async def get_inventory(
        self, collector_id: str, limit: int = 100, skip: int = 0
    ) -> CollectorInventoryListResponse:
        items = await inventory_repository.get_by_collector(collector_id, limit=limit, skip=skip)
        total = await inventory_repository.count_by_collector(collector_id)
        total_w, total_v = await inventory_repository.get_total_weight_and_value(collector_id)

        return CollectorInventoryListResponse(
            items=[
                CollectorInventoryResponse(
                    id=i.id,
                    collector_id=i.collector_id,
                    source_listing_id=i.source_listing_id,
                    pickup_id=i.pickup_id,
                    material=i.material,
                    category=i.category,
                    quantity=i.quantity,
                    unit=i.unit,
                    quality=i.quality,
                    images=i.images,
                    estimated_value=i.estimated_value,
                    status=i.status,
                    created_at=i.created_at,
                    updated_at=i.updated_at,
                )
                for i in items
            ],
            total=total,
            total_weight_kg=round(total_w, 1),
            total_estimated_value=round(total_v, 2),
        )

    async def get_inventory_item(self, inventory_id: str, collector_id: str) -> CollectorInventoryResponse:
        item = await inventory_repository.get_by_id(inventory_id)
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        if item.collector_id != collector_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this inventory")
        return CollectorInventoryResponse(**item.model_dump())

    async def get_profile(self, collector_id: str) -> CollectorProfileResponse:
        prof = await self._get_profile_repo().get_by_user_id(collector_id)
        if not prof:
            return CollectorProfileResponse(
                user_id=collector_id,
                name="Collection Partner",
                service_area="Metro Zone 1",
                is_verified=False,
                rating=4.9,
                total_pickups=0,
            )
        return CollectorProfileResponse(
            user_id=prof.user_id,
            name=prof.name,
            phone=prof.phone,
            avatar_url=prof.avatar_url,
            service_area=prof.service_area or "Metro Zone 1",
            is_verified=prof.is_verified,
            rating=prof.rating,
            total_pickups=prof.total_pickups,
            location=prof.location,
        )

    async def update_profile(
        self, collector_id: str, data: CollectorProfileUpdate
    ) -> CollectorProfileResponse:
        repo = self._get_profile_repo()
        prof = await repo.get_by_user_id(collector_id)
        update_dict = data.model_dump(exclude_unset=True)

        if prof:
            updated = await repo.update(prof.id, update_dict)
            return CollectorProfileResponse(**updated.model_dump())
        else:
            new_prof = Profile(
                user_id=collector_id,
                name=data.name or "Collection Partner",
                phone=data.phone,
                avatar_url=data.avatar_url,
                service_area=data.service_area or "Metro Zone 1",
                location=data.location,
            )
            created = await repo.create(new_prof)
            return CollectorProfileResponse(**created.model_dump())


collector_service = CollectorService()
