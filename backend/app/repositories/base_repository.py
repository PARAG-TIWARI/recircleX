from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from backend.app.models.base import BaseMongoModel
from backend.app.db.mongodb import get_database

ModelType = TypeVar("ModelType", bound=BaseMongoModel)


class BaseRepository(Generic[ModelType]):
    def __init__(
        self,
        collection_name: str,
        model_class: Type[ModelType],
        db: Optional[AsyncIOMotorDatabase] = None,
    ):
        self._db = db
        self.collection_name = collection_name
        self.model_class = model_class

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db is not None:
            return self._db
        return get_database()

    @property
    def collection(self):
        return self.db[self.collection_name]

    async def get_by_id(self, id: str) -> Optional[ModelType]:
        query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
        doc = await self.collection.find_one(query)
        if doc:
            doc["_id"] = str(doc["_id"])
            return self.model_class(**doc)
        return None

    async def find_one(self, query: Dict[str, Any]) -> Optional[ModelType]:
        doc = await self.collection.find_one(query)
        if doc:
            doc["_id"] = str(doc["_id"])
            return self.model_class(**doc)
        return None

    async def find(self, query: Dict[str, Any], skip: int = 0, limit: int = 100) -> List[ModelType]:
        cursor = self.collection.find(query).skip(skip).limit(limit)
        results: List[ModelType] = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(self.model_class(**doc))
        return results

    async def create(self, item: ModelType) -> ModelType:
        item_dict = item.model_dump(by_alias=True, exclude_none=True)
        if "_id" in item_dict and item_dict["_id"] is None:
            del item_dict["_id"]
        result = await self.collection.insert_one(item_dict)
        item.id = str(result.inserted_id)
        return item

    async def update(self, id: str, update_data: Dict[str, Any]) -> Optional[ModelType]:
        query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
        await self.collection.update_one(query, {"$set": update_data})
        return await self.get_by_id(id)

    async def delete(self, id: str) -> bool:
        query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
        res = await self.collection.delete_one(query)
        return res.deleted_count > 0
