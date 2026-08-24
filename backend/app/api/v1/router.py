from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.users import router as users_router
from backend.app.api.v1.profiles import router as profiles_router
from backend.app.api.v1.listings import router as listings_router
from backend.app.api.v1.pickups import router as pickups_router
from backend.app.api.v1.addresses import router as addresses_router
from backend.app.api.v1.ai import router as ai_router
from backend.app.api.v1.impact import router as impact_router
from backend.app.api.v1.storage import router as storage_router
from backend.app.api.v1.collector import router as collector_router
from backend.app.api.v1.notifications import router as notifications_router
from backend.app.api.v1.marketplace import router as marketplace_router
from backend.app.api.v1.orders import router as orders_router
from backend.app.api.v1.recycler import router as recycler_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(profiles_router)
api_v1_router.include_router(listings_router)
api_v1_router.include_router(pickups_router)
api_v1_router.include_router(addresses_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(impact_router)
api_v1_router.include_router(storage_router)
api_v1_router.include_router(collector_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(marketplace_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(recycler_router)
