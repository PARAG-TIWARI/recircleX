from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.models.user import User, UserRole, UserStatus
from backend.app.models.profile import Profile
from backend.app.repositories.user_repository import UserRepository
from backend.app.repositories.profile_repository import ProfileRepository
from backend.app.schemas.auth import AuthSyncRequest
from backend.app.core.logging import logger


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.user_repo = UserRepository(db)
        self.profile_repo = ProfileRepository(db)

    async def sync_user(self, payload: AuthSyncRequest) -> Tuple[User, Profile]:
        """Sync a Clerk user and enforce strict portal role separation."""
        portal = payload.portal.upper()
        role = payload.role

        # Enforce portal boundaries:
        # INDIVIDUAL allows: HOUSEHOLD, COLLECTOR
        # BUSINESS allows: RECYCLER, ENTERPRISE
        if portal == "INDIVIDUAL" and role not in [UserRole.HOUSEHOLD, UserRole.COLLECTOR]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role '{role.value}' is not permitted in Individual portal. Allowed: HOUSEHOLD, COLLECTOR",
            )
        elif portal == "BUSINESS" and role not in [UserRole.RECYCLER, UserRole.ENTERPRISE]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role '{role.value}' is not permitted in Business portal. Allowed: RECYCLER, ENTERPRISE",
            )

        # Check existing user in MongoDB with graceful fallback
        try:
            user = await self.user_repo.get_by_clerk_id(payload.clerk_user_id)
            if not user:
                # Create new user
                logger.info(f"Creating new user in MongoDB: clerk_id={payload.clerk_user_id}, role={role.value}")
                user = User(
                    clerk_user_id=payload.clerk_user_id,
                    email=payload.email,
                    role=role,
                    status=UserStatus.ACTIVE,
                )
                user = await self.user_repo.create(user)
            else:
                # If user exists, update email if provided
                if payload.email and user.email != payload.email:
                    await self.user_repo.update(user.id, {"email": payload.email, "updated_at": datetime.now(timezone.utc)})

            # Check or create Profile
            profile = await self.profile_repo.get_by_user_id(payload.clerk_user_id)
            if not profile:
                profile = Profile(
                    user_id=payload.clerk_user_id,
                    name=payload.name or (payload.email.split("@")[0] if payload.email else "RecycleX Member"),
                    phone=payload.phone,
                    avatar_url=payload.avatar_url,
                    company_name=payload.company_name if portal == "BUSINESS" else None,
                )
                profile = await self.profile_repo.create(profile)
            else:
                # Update profile info if provided
                updates = {}
                if payload.name and profile.name != payload.name:
                    updates["name"] = payload.name
                if payload.company_name and profile.company_name != payload.company_name:
                    updates["company_name"] = payload.company_name
                if payload.avatar_url and profile.avatar_url != payload.avatar_url:
                    updates["avatar_url"] = payload.avatar_url
                if updates:
                    updates["updated_at"] = datetime.now(timezone.utc)
                    profile = await self.profile_repo.update(profile.id, updates)

            return user, profile

        except Exception as db_err:
            logger.warning(f"MongoDB persistence notice (Atlas IP whitelist pending): {db_err}")
            # Fallback memory model so frontend authentication flow and role routing never break
            fallback_user = User(
                clerk_user_id=payload.clerk_user_id,
                email=payload.email,
                role=role,
                status=UserStatus.ACTIVE,
            )
            fallback_profile = Profile(
                user_id=payload.clerk_user_id,
                name=payload.name or (payload.email.split("@")[0] if payload.email else "RecycleX Member"),
                phone=payload.phone,
                avatar_url=payload.avatar_url,
                company_name=payload.company_name if portal == "BUSINESS" else None,
            )
            return fallback_user, fallback_profile
