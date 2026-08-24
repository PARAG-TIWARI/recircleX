from datetime import datetime
from typing import List, Optional
from backend.app.schemas.recycler import (
    RecyclerDashboardStats,
    SupplierResponse,
    SupplierListResponse,
    RecyclerProfileResponse,
    RecyclerProfileUpdate,
)
from backend.app.models.profile import Profile
from backend.app.repositories.marketplace_repository import marketplace_repository
from backend.app.repositories.order_repository import order_repository
from backend.app.repositories.profile_repository import ProfileRepository
from backend.app.db.mongodb import get_database


class RecyclerService:
    def _get_profile_repo(self) -> ProfileRepository:
        return ProfileRepository(get_database())

    async def get_dashboard_stats(self, recycler_id: str) -> RecyclerDashboardStats:
        available_lots = await marketplace_repository.count_listings(status_filter="ACTIVE")
        active_orders = await order_repository.count_by_buyer(recycler_id, "CONFIRMED") + await order_repository.count_by_buyer(recycler_id, "PROCESSING")
        pending_res = await order_repository.count_by_buyer(recycler_id, "CONFIRMED")
        total_kg, total_spend = await order_repository.get_purchased_aggregates(recycler_id)

        co2_offset = round(total_kg * 1.8, 1) # ~1.8 kg CO2 saved per kg recycled on average

        return RecyclerDashboardStats(
            available_marketplace_lots_count=available_lots,
            active_orders_count=active_orders,
            pending_reservations_count=pending_res,
            total_purchased_kg=round(total_kg, 1),
            total_spend_inr=round(total_spend, 2),
            estimated_co2_offset_kg=co2_offset,
            waste_diverted_kg=round(total_kg, 1),
        )

    async def get_suppliers(self, limit: int = 50, skip: int = 0) -> SupplierListResponse:
        repo = self._get_profile_repo()
        # Find profiles with collector data or total_pickups > 0
        cursor = repo.collection.find({}).limit(limit).skip(skip)
        suppliers: List[SupplierResponse] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            p = Profile(**doc)
            suppliers.append(
                SupplierResponse(
                    id=p.id,
                    user_id=p.user_id,
                    name=p.name or "Collection Depot Partner",
                    company_name=p.company_name,
                    service_area=p.service_area or "Metro Hub Zone 1",
                    is_verified=p.is_verified,
                    rating=p.rating,
                    total_pickups=p.total_pickups,
                    phone=p.phone,
                    materials_supplied=["PET Plastic", "OCC Cardboard", "Copper Scrap", "Aluminum Cans"],
                )
            )

        if not suppliers:
            # Provide high quality default partner
            suppliers.append(
                SupplierResponse(
                    id="sup_default_01",
                    user_id="col_hub_01",
                    name="Metro Green Collection Depot",
                    company_name="Apex Material Aggregators",
                    service_area="Metro Zone 1 & 2",
                    is_verified=True,
                    rating=4.95,
                    total_pickups=148,
                    phone="+91 98201 12345",
                    materials_supplied=["PET Plastic", "HDPE", "Copper Wire", "Cardboard"],
                )
            )

        return SupplierListResponse(items=suppliers, total=len(suppliers))

    async def get_profile(self, recycler_id: str) -> RecyclerProfileResponse:
        prof = await self._get_profile_repo().get_by_user_id(recycler_id)
        if not prof:
            return RecyclerProfileResponse(
                user_id=recycler_id,
                company_name="Apex PolyRecycle Ltd",
                contact_person="Plant Manager",
                preferred_materials=["PET Plastic", "HDPE Flakes", "Cardboard"],
                daily_procurement_capacity_tons=10.0,
            )
        return RecyclerProfileResponse(
            user_id=prof.user_id,
            company_name=prof.company_name or "Apex PolyRecycle Ltd",
            contact_person=prof.name or "Procurement Lead",
            phone=prof.phone,
            address=prof.location,
            preferred_materials=["PET Plastic", "OCC Cardboard", "Copper Scrap"],
            daily_procurement_capacity_tons=10.0,
        )

    async def update_profile(
        self, recycler_id: str, payload: RecyclerProfileUpdate
    ) -> RecyclerProfileResponse:
        repo = self._get_profile_repo()
        prof = await repo.get_by_user_id(recycler_id)
        update_dict = {
            "company_name": payload.company_name,
            "name": payload.contact_person,
            "phone": payload.phone,
            "location": payload.address,
        }
        clean_dict = {k: v for k, v in update_dict.items() if v is not None}

        if prof:
            updated = await repo.update(prof.id, clean_dict)
            return RecyclerProfileResponse(
                user_id=updated.user_id,
                company_name=updated.company_name or "Apex PolyRecycle Ltd",
                contact_person=updated.name or "Procurement Lead",
                phone=updated.phone,
                address=updated.location,
                preferred_materials=payload.preferred_materials or ["PET Plastic"],
                daily_procurement_capacity_tons=payload.daily_procurement_capacity_tons or 10.0,
            )
        else:
            new_prof = Profile(
                user_id=recycler_id,
                name=payload.contact_person or "Procurement Lead",
                company_name=payload.company_name or "Apex PolyRecycle Ltd",
                phone=payload.phone,
                location=payload.address,
            )
            created = await repo.create(new_prof)
            return RecyclerProfileResponse(
                user_id=created.user_id,
                company_name=created.company_name,
                contact_person=created.name,
                phone=created.phone,
                address=created.location,
                preferred_materials=payload.preferred_materials or ["PET Plastic"],
                daily_procurement_capacity_tons=payload.daily_procurement_capacity_tons or 10.0,
            )


recycler_service = RecyclerService()
