import time
import asyncio
from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.db.mongodb import db_manager
from backend.app.schemas.common import APIResponse

router = APIRouter(prefix="/health", tags=["Health"])

START_TIME = time.time()


@router.get("", response_model=APIResponse)
async def check_health():
    """Health check endpoint verifying API uptime and MongoDB Atlas connectivity."""
    db_status = "disconnected"
    db_name = settings.database_name

    try:
        if db_manager.client is not None:
            await asyncio.wait_for(db_manager.client.admin.command("ping"), timeout=2.0)
            db_status = "connected"
    except asyncio.TimeoutError:
        db_status = "unreachable (ping timeout)"
    except Exception as e:
        db_status = f"unreachable ({type(e).__name__})"


    return APIResponse(
        success=True,
        message="RecycleX API is healthy",
        data={
            "status": "healthy",
            "app_name": settings.APP_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "database": {
                "name": db_name,
                "status": db_status,
            },
            "uptime_seconds": round(time.time() - START_TIME, 2),
        },
    )
