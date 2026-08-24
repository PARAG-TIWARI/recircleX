import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db_manager = MongoDB()


async def connect_to_mongo() -> None:
    """Initialize MongoDB connection and create essential indexes."""
    try:
        db_name = settings.database_name
        logger.info(f"Connecting to MongoDB Atlas (database: {db_name})...")
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=4000,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True,
        )
        db_manager.db = db_manager.client[db_name]
        
        # Test connection ping
        await db_manager.client.admin.command("ping")
        logger.info(f"Connected to MongoDB Atlas ({db_name}) successfully.")

        # Create indexes
        await _create_indexes()
    except Exception as e:
        logger.warning(f"MongoDB connection check note: {e}. Running with lazy reconnect.")


async def close_mongo_connection() -> None:
    """Close MongoDB connection gracefully."""
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")


async def _create_indexes() -> None:
    """Create essential indexes for performance and uniqueness."""
    if db_manager.db is None:
        return
    try:
        users = db_manager.db.users
        await users.create_index("clerk_user_id", unique=True, sparse=True)
        await users.create_index("email", unique=True, sparse=True)
        await users.create_index("role")

        profiles = db_manager.db.profiles
        await profiles.create_index("user_id", unique=True)
        
        materials = db_manager.db.materials
        await materials.create_index("code", unique=True)

        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.warning(f"Failed to create indexes: {e}")


def get_database() -> AsyncIOMotorDatabase:
    """Dependency / accessor for database."""
    if db_manager.db is None:
        db_name = settings.database_name
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True,
        )
        db_manager.db = db_manager.client[db_name]
    return db_manager.db
