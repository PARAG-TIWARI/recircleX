import asyncio
import os
import certifi
import ssl
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME") or "recyclex_db"

async def test_conn():
    print("Testing standard connection...")
    try:
        client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tlsAllowInvalidCertificates=True,
        )
        db = client[MONGODB_DB_NAME]
        res = await client.admin.command("ping")
        print("Ping result:", res)
        cols = await db.list_collection_names()
        print("Collections:", cols)
        client.close()
    except Exception as e:
        print("Error with tlsAllowInvalidCertificates:", e)

if __name__ == "__main__":
    asyncio.run(test_conn())
