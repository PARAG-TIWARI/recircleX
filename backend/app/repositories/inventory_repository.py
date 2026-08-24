from typing import List, Optional
from backend.app.repositories.base_repository import BaseRepository
from backend.app.models.inventory import Inventory


class InventoryRepository(BaseRepository[Inventory]):
    def __init__(self):
        super().__init__(collection_name="inventory", model_class=Inventory)

    async def get_by_collector(self, collector_id: str, limit: int = 100, skip: int = 0) -> List[Inventory]:
        cursor = self.collection.find({"collector_id": collector_id}).sort("created_at", -1).skip(skip).limit(limit)
        results: List[Inventory] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_by_collector(self, collector_id: str) -> int:
        return await self.collection.count_documents({"collector_id": collector_id})

    async def get_total_weight_and_value(self, collector_id: str):
        pipeline = [
            {"$match": {"collector_id": collector_id, "status": "AVAILABLE"}},
            {
                "$group": {
                    "_id": None,
                    "total_weight": {"$sum": "$quantity"},
                    "total_value": {"$sum": "$estimated_value"},
                }
            },
        ]
        cursor = self.collection.aggregate(pipeline)
        docs = await cursor.to_list(length=1)
        if docs:
            return float(docs[0].get("total_weight", 0.0)), float(docs[0].get("total_value", 0.0))
        return 0.0, 0.0


inventory_repository = InventoryRepository()
