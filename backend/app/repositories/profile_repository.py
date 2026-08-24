from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.models.profile import Profile
from backend.app.repositories.base_repository import BaseRepository


class ProfileRepository(BaseRepository[Profile]):
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        super().__init__(collection_name="profiles", model_class=Profile, db=db)

    async def get_by_user_id(self, user_id: str) -> Optional[Profile]:
        return await self.find_one({"user_id": user_id})
