from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.models.user import User
from backend.app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        super().__init__(collection_name="users", model_class=User, db=db)

    async def get_by_clerk_id(self, clerk_user_id: str) -> Optional[User]:
        return await self.find_one({"clerk_user_id": clerk_user_id})

    async def get_by_email(self, email: str) -> Optional[User]:
        return await self.find_one({"email": email})
