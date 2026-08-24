from typing import List, Optional
from backend.app.repositories.base_repository import BaseRepository
from backend.app.models.address import Address


class AddressRepository(BaseRepository[Address]):
    def __init__(self):
        super().__init__(collection_name="addresses", model_class=Address)

    async def get_by_user(self, user_id: str) -> List[Address]:
        cursor = self.collection.find({"user_id": user_id}).sort("is_default", -1)
        results: List[Address] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def get_default(self, user_id: str) -> Optional[Address]:
        return await self.find_one({"user_id": user_id, "is_default": True})

    async def unset_default(self, user_id: str) -> None:
        await self.collection.update_many({"user_id": user_id}, {"$set": {"is_default": False}})


address_repository = AddressRepository()
