import asyncio
import os
import sys
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME") or os.getenv("MONGODB_DATABASE") or "recyclex_db"


async def clear_database():
    print(f"Connecting to MongoDB Atlas (Database: {MONGODB_DB_NAME})...")
    client = AsyncIOMotorClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=8000,
        tlsCAFile=certifi.where(),
    )
    db = client[MONGODB_DB_NAME]

    try:
        # Ping
        await client.admin.command("ping")
        print("Connected to MongoDB Atlas successfully.")

        # List existing collections
        collections = await db.list_collection_names()
        print(f"Existing collections found: {collections}")

        if collections:
            print("Cleaning up existing collections...")
            for col in collections:
                await db[col].drop()
                print(f" - Dropped collection: {col}")
            print("All collections dropped successfully. Database is clean.")
        else:
            print("Database is already empty and clean.")

    except Exception as e:
        print(f"Error during database operation: {e}")
    finally:
        client.close()
        print("Database connection closed.")


if __name__ == "__main__":
    asyncio.run(clear_database())
