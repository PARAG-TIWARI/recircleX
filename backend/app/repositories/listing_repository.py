from typing import List, Optional
from backend.app.repositories.base_repository import BaseRepository
from backend.app.models.listing import Listing


class ListingRepository(BaseRepository[Listing]):
    def __init__(self):
        super().__init__(collection_name="listings", model_class=Listing)

    async def get_by_owner(self, owner_id: str, limit: int = 50, skip: int = 0) -> List[Listing]:
        cursor = self.collection.find({"owner_id": owner_id}).sort("created_at", -1).skip(skip).limit(limit)
        results: List[Listing] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_by_owner(self, owner_id: str) -> int:
        return await self.collection.count_documents({"owner_id": owner_id})

    async def get_active_count_by_owner(self, owner_id: str) -> int:
        return await self.collection.count_documents({"owner_id": owner_id, "status": "AVAILABLE"})


listing_repository = ListingRepository()
