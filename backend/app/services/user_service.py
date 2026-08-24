from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.models.user import User
from backend.app.models.profile import Profile
from backend.app.repositories.user_repository import UserRepository
from backend.app.repositories.profile_repository import ProfileRepository
from backend.app.schemas.profile import ProfileUpdate


class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.user_repo = UserRepository(db)
        self.profile_repo = ProfileRepository(db)

    async def get_user_by_clerk_id(self, clerk_user_id: str) -> Optional[User]:
        return await self.user_repo.get_by_clerk_id(clerk_user_id)

    async def get_profile(self, user_id: str) -> Optional[Profile]:
        return await self.profile_repo.get_by_user_id(user_id)

    async def update_profile(self, user_id: str, payload: ProfileUpdate) -> Optional[Profile]:
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            return None
        
        update_dict = payload.model_dump(exclude_unset=True)
        if update_dict:
            return await self.profile_repo.update(profile.id, update_dict)
        return profile
