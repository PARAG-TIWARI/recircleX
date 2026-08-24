from typing import List, Dict
from backend.app.schemas.impact import HouseholdImpactResponse, CategoryImpactItem
from backend.app.repositories.pickup_repository import pickup_repository
from backend.app.repositories.listing_repository import listing_repository
from backend.app.services.ai_service import MATERIAL_RATES


class ImpactService:
    """Calculates real household recycling stats and estimated CO2 emission offsets."""

    async def get_household_impact(self, user_id: str) -> HouseholdImpactResponse:
        completed_pickups = await pickup_repository.get_completed_by_household(user_id)
        active_listings = await listing_repository.get_active_count_by_owner(user_id)

        total_weight = 0.0
        total_earnings = 0.0
        category_weights: Dict[str, float] = {}

        for p in completed_pickups:
            listing = await listing_repository.get_by_id(p.listing_id)
            weight = p.actual_weight or (listing.quantity if listing else 5.0)
            total_weight += weight

            amount = p.final_amount or (listing.estimated_price if listing else 150.0)
            total_earnings += amount

            cat = listing.category if listing else "General"
            category_weights[cat] = category_weights.get(cat, 0.0) + weight

        # Standard emission factors (approx 1.8 kg CO2 saved per kg of segregated waste)
        co2_saved = round(total_weight * 1.8, 1)
        trees = round(co2_saved / 21.0, 2)  # ~21kg CO2 absorbed per tree per year
        landfill = round(total_weight * 0.95, 1)

        categories_list: List[CategoryImpactItem] = []
        for cat, w in category_weights.items():
            pct = round((w / total_weight) * 100, 1) if total_weight > 0 else 0.0
            cat_co2 = round(w * 1.8, 1)
            categories_list.append(
                CategoryImpactItem(
                    category=cat,
                    weight_kg=round(w, 1),
                    percentage=pct,
                    co2_saved_kg=cat_co2,
                )
            )

        if not categories_list:
            categories_list = [
                CategoryImpactItem(category="Plastic", weight_kg=0.0, percentage=0.0, co2_saved_kg=0.0),
                CategoryImpactItem(category="Paper", weight_kg=0.0, percentage=0.0, co2_saved_kg=0.0),
                CategoryImpactItem(category="Metal", weight_kg=0.0, percentage=0.0, co2_saved_kg=0.0),
                CategoryImpactItem(category="E-Waste", weight_kg=0.0, percentage=0.0, co2_saved_kg=0.0),
            ]

        return HouseholdImpactResponse(
            total_material_recycled_kg=round(total_weight, 1),
            total_pickups_completed=len(completed_pickups),
            active_listings_count=active_listings,
            estimated_earnings_inr=round(total_earnings, 2),
            estimated_co2_offset_kg=co2_saved,
            trees_equivalent=trees,
            landfill_diverted_kg=landfill,
            categories=categories_list,
        )


impact_service = ImpactService()
