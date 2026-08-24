import jwt
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.db.mongodb import get_database
from backend.app.models.user import User, UserRole, UserStatus
from backend.app.repositories.user_repository import UserRepository

security = HTTPBearer(auto_error=False)


def decode_clerk_token(token: str) -> Dict[str, Any]:
    """Decode and extract claims from Clerk JWT."""
    try:
        claims = jwt.decode(
            token,
            options={
                "verify_signature": False,
                "verify_exp": True,
                "require": ["sub", "exp"],
            },
        )
        return claims
    except Exception as e:
        logger.warning(f"Failed to decode token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db=Depends(get_database),
) -> User:
    """Dependency that extracts the authenticated User model from MongoDB."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    claims = decode_clerk_token(token)
    clerk_user_id = claims.get("sub") or claims.get("user_id")

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims: missing user identifier",
        )

    user_repo = UserRepository(db)
    user_model = None
    try:
        user_model = await user_repo.get_by_clerk_id(clerk_user_id)
    except Exception as e:
        logger.warning(f"Error fetching user from database: {e}")

    if not user_model:
        email = claims.get("email") or claims.get("email_address") or f"{clerk_user_id}@recyclex.in"
        role_str = (
            claims.get("role")
            or claims.get("public_metadata", {}).get("role")
            or "HOUSEHOLD"
        )
        try:
            role = UserRole(role_str)
        except ValueError:
            role = UserRole.HOUSEHOLD

        user_model = User(
            clerk_user_id=clerk_user_id,
            email=email,
            role=role,
            status=UserStatus.ACTIVE,
        )

    return user_model


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db=Depends(get_database),
) -> Optional[User]:
    """Optional authentication dependency for public endpoints like EcoBot."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except Exception:
        return None


def require_role(*allowed_roles: UserRole):
    """Dependency factory for role-based access control."""
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Allowed roles: {[r.value for r in allowed_roles]}",
            )
        return user

    return role_checker
