from typing import List, Optional
from backend.app.repositories.base_repository import BaseRepository
from backend.app.models.pickup import PickupRequest


class PickupRepository(BaseRepository[PickupRequest]):
    def __init__(self):
        super().__init__(collection_name="pickups", model_class=PickupRequest)

    async def get_by_household(self, household_id: str, limit: int = 50, skip: int = 0) -> List[PickupRequest]:
        cursor = self.collection.find({"household_id": household_id}).sort("created_at", -1).skip(skip).limit(limit)
        results: List[PickupRequest] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_by_household(self, household_id: str) -> int:
        return await self.collection.count_documents({"household_id": household_id})

    async def get_completed_by_household(self, household_id: str) -> List[PickupRequest]:
        cursor = self.collection.find({"household_id": household_id, "status": "COLLECTED"})
        results: List[PickupRequest] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def get_by_listing_id(self, listing_id: str) -> Optional[PickupRequest]:
        return await self.find_one({"listing_id": listing_id})

    # Collector Queries
    async def get_available_requests(self, limit: int = 50, skip: int = 0) -> List[PickupRequest]:
        cursor = self.collection.find({"status": "REQUESTED"}).sort("created_at", -1).skip(skip).limit(limit)
        results: List[PickupRequest] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_available_requests(self) -> int:
        return await self.collection.count_documents({"status": "REQUESTED"})

    async def get_by_collector(
        self, collector_id: str, status_filter: Optional[str] = None, limit: int = 50, skip: int = 0
    ) -> List[PickupRequest]:
        query = {"collector_id": collector_id}
        if status_filter:
            query["status"] = status_filter
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        results: List[PickupRequest] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_by_collector(self, collector_id: str, status_filter: Optional[str] = None) -> int:
        query = {"collector_id": collector_id}
        if status_filter:
            query["status"] = status_filter
        return await self.collection.count_documents(query)


pickup_repository = PickupRepository()
