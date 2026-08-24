from typing import List, Optional, Dict, Any
from backend.app.repositories.base_repository import BaseRepository
from backend.app.models.marketplace import MarketplaceListing


class MarketplaceRepository(BaseRepository[MarketplaceListing]):
    def __init__(self):
        super().__init__(collection_name="marketplace_listings", model_class=MarketplaceListing)

    async def find_listings(
        self,
        category: Optional[str] = None,
        material: Optional[str] = None,
        quality: Optional[str] = None,
        city: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        status_filter: str = "ACTIVE",
        limit: int = 50,
        skip: int = 0,
    ) -> List[MarketplaceListing]:
        query: Dict[str, Any] = {}
        if status_filter:
            query["status"] = status_filter
        if category and category.lower() != "all":
            query["category"] = {"$regex": f"^{category}$", "$options": "i"}
        if material and material.lower() != "all":
            query["material"] = {"$regex": material, "$options": "i"}
        if quality and quality.lower() != "all":
            query["quality"] = quality
        if city:
            query["location.city"] = {"$regex": city, "$options": "i"}
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"material": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
            ]

        # Sorting
        sort_field = "created_at"
        sort_direction = -1
        if sort_by == "price_asc":
            sort_field = "price_per_unit"
            sort_direction = 1
        elif sort_by == "price_desc":
            sort_field = "price_per_unit"
            sort_direction = -1
        elif sort_by == "qty_desc":
            sort_field = "quantity"
            sort_direction = -1

        cursor = self.collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
        results: List[MarketplaceListing] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_listings(
        self,
        category: Optional[str] = None,
        material: Optional[str] = None,
        status_filter: str = "ACTIVE",
    ) -> int:
        query: Dict[str, Any] = {}
        if status_filter:
            query["status"] = status_filter
        if category and category.lower() != "all":
            query["category"] = {"$regex": f"^{category}$", "$options": "i"}
        if material and material.lower() != "all":
            query["material"] = {"$regex": material, "$options": "i"}
        return await self.collection.count_documents(query)

    async def get_by_seller(
        self, seller_id: str, status_filter: Optional[str] = None, limit: int = 50, skip: int = 0
    ) -> List[MarketplaceListing]:
        query = {"seller_id": seller_id}
        if status_filter:
            query["status"] = status_filter
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        results: List[MarketplaceListing] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results


marketplace_repository = MarketplaceRepository()
