from typing import List, Optional
from backend.app.repositories.base_repository import BaseRepository
from backend.app.models.notification import Notification


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self):
        super().__init__(collection_name="notifications", model_class=Notification)

    async def get_by_user(self, user_id: str, limit: int = 50) -> List[Notification]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        results: List[Notification] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def count_unread(self, user_id: str) -> int:
        return await self.collection.count_documents({"user_id": user_id, "is_read": False})

    async def mark_read(self, notification_id: str, user_id: str) -> bool:
        res = await self.collection.update_one(
            {"_id": notification_id, "user_id": user_id},
            {"$set": {"is_read": True}},
        )
        return res.modified_count > 0


notification_repository = NotificationRepository()
