from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError
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
        """Sync a Clerk user and enforce strict portal role separation.

        Lookup order:
        1. Find by clerk_user_id (exact match).
        2. If not found, find by email and reconcile the clerk_user_id.
        3. If neither exists, create a new user.
        """
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

        try:
            user = await self._resolve_or_create_user(payload, role)
            profile = await self._resolve_or_create_profile(payload, portal)
            return user, profile

        except HTTPException:
            raise
        except DuplicateKeyError as dup_err:
            logger.warning(f"Duplicate key conflict during user sync: {dup_err}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email or identity already exists. Please sign in with your existing account.",
            )
        except Exception as db_err:
            logger.error(f"MongoDB persistence error during user sync: {db_err}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service currently unavailable. Please verify backend MongoDB Atlas connection string and network access.",
            )

    async def _resolve_or_create_user(
        self, payload: AuthSyncRequest, role: UserRole
    ) -> User:
        """Find an existing user by clerk_user_id or email, or create a new one."""
        # Step 1: Lookup by clerk_user_id
        user = await self.user_repo.get_by_clerk_id(payload.clerk_user_id)

        if user:
            # Existing user found by clerk_user_id — update email if changed
            if payload.email and user.email != payload.email:
                # Guard: make sure the new email isn't already taken by another user
                existing_email_owner = await self.user_repo.get_by_email(payload.email)
                if existing_email_owner and existing_email_owner.id != user.id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="This email address is already associated with another account.",
                    )
                await self.user_repo.update(
                    user.id,
                    {"email": payload.email, "updated_at": datetime.now(timezone.utc)},
                )
                user.email = payload.email
            return user

        # Step 2: Clerk user_id not found — check for existing user by email
        if payload.email:
            user = await self.user_repo.get_by_email(payload.email)
            if user:
                # Reconcile: link this existing email-based user to the new clerk_user_id.
                # This covers re-registration or Clerk account reset scenarios.
                old_clerk_id = user.clerk_user_id
                logger.info(
                    f"Reconciling user by email: email={payload.email}, "
                    f"old_clerk_id={old_clerk_id}, new_clerk_id={payload.clerk_user_id}"
                )
                await self.user_repo.update(
                    user.id,
                    {
                        "clerk_user_id": payload.clerk_user_id,
                        "updated_at": datetime.now(timezone.utc),
                    },
                )
                user.clerk_user_id = payload.clerk_user_id

                # Reconcile linked profile: update user_id from old clerk_id to new
                old_profile = await self.profile_repo.get_by_user_id(old_clerk_id)
                if old_profile:
                    await self.profile_repo.update(
                        old_profile.id,
                        {
                            "user_id": payload.clerk_user_id,
                            "updated_at": datetime.now(timezone.utc),
                        },
                    )

                return user

        # Step 3: Truly new user — create
        logger.info(
            f"Creating new user in MongoDB: clerk_id={payload.clerk_user_id}, role={role.value}"
        )
        user = User(
            clerk_user_id=payload.clerk_user_id,
            email=payload.email,
            role=role,
            status=UserStatus.ACTIVE,
        )
        user = await self.user_repo.create(user)
        return user

    async def _resolve_or_create_profile(
        self, payload: AuthSyncRequest, portal: str
    ) -> Profile:
        """Find an existing profile by clerk_user_id, or create a new one."""
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

        return profile
