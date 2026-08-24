from typing import List, Optional, Dict, Any
from backend.app.repositories.base_repository import BaseRepository
from backend.app.models.order import Order


class OrderRepository(BaseRepository[Order]):
    def __init__(self):
        super().__init__(collection_name="orders", model_class=Order)

    async def get_by_buyer(
        self, buyer_id: str, status_filter: Optional[str] = None, limit: int = 50, skip: int = 0
    ) -> List[Order]:
        query: Dict[str, Any] = {"buyer_id": buyer_id}
        if status_filter:
            query["status"] = status_filter
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        results: List[Order] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_by_buyer(self, buyer_id: str, status_filter: Optional[str] = None) -> int:
        query: Dict[str, Any] = {"buyer_id": buyer_id}
        if status_filter:
            query["status"] = status_filter
        return await self.collection.count_documents(query)

    async def get_by_seller(
        self, seller_id: str, status_filter: Optional[str] = None, limit: int = 50, skip: int = 0
    ) -> List[Order]:
        query: Dict[str, Any] = {"seller_id": seller_id}
        if status_filter:
            query["status"] = status_filter
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        results: List[Order] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_by_seller(self, seller_id: str, status_filter: Optional[str] = None) -> int:
        query: Dict[str, Any] = {"seller_id": seller_id}
        if status_filter:
            query["status"] = status_filter
        return await self.collection.count_documents(query)

    async def get_purchased_aggregates(self, buyer_id: str):
        pipeline = [
            {"$match": {"buyer_id": buyer_id, "status": {"$ne": "CANCELLED"}}},
            {
                "$group": {
                    "_id": None,
                    "total_kg": {"$sum": "$quantity"},
                    "total_spend": {"$sum": "$total_amount"},
                }
            },
        ]
        cursor = self.collection.aggregate(pipeline)
        docs = await cursor.to_list(length=1)
        if docs:
            return float(docs[0].get("total_kg", 0.0)), float(docs[0].get("total_spend", 0.0))
        return 0.0, 0.0


order_repository = OrderRepository()
