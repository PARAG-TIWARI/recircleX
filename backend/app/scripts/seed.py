import asyncio
import os
from datetime import datetime, timezone
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME") or os.getenv("MONGODB_DATABASE") or "recyclex_db"


DEMO_USERS = [
    {
        "clerk_user_id": "user_demo_household_01",
        "email": "household.demo@recyclex.io",
        "role": "HOUSEHOLD",
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "profile": {
            "name": "Sarah Sharma",
            "phone": "+91 98765 43210",
            "company_name": None,
            "location": {"city": "Mumbai", "state": "Maharashtra", "postal_code": "400001"},
        },
    },
    {
        "clerk_user_id": "user_demo_collector_01",
        "email": "collector.demo@recyclex.io",
        "role": "COLLECTOR",
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "profile": {
            "name": "Rajesh Green Collection Hub",
            "phone": "+91 98765 11223",
            "company_name": "GreenLogistics Express",
            "location": {"city": "Mumbai", "state": "Maharashtra", "postal_code": "400050"},
        },
    },
    {
        "clerk_user_id": "user_demo_recycler_01",
        "email": "recycler.demo@recyclex.io",
        "role": "RECYCLER",
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "profile": {
            "name": "Apex Polymer Recycling Ltd",
            "phone": "+91 98765 99887",
            "company_name": "Apex Polymer Recycling Ltd",
            "location": {"city": "Navi Mumbai", "state": "Maharashtra", "postal_code": "400703"},
        },
    },
    {
        "clerk_user_id": "user_demo_enterprise_01",
        "email": "enterprise.demo@recyclex.io",
        "role": "ENTERPRISE",
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "profile": {
            "name": "Global Packaging & Consumer Goods Corp",
            "phone": "+91 98765 55443",
            "company_name": "Global Packaging Corp",
            "location": {"city": "Pune", "state": "Maharashtra", "postal_code": "411001"},
        },
    },
    {
        "clerk_user_id": "user_demo_admin_01",
        "email": "admin@recyclex.io",
        "role": "ADMIN",
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "profile": {
            "name": "RecycleX Platform Admin",
            "phone": "+91 98000 00000",
            "company_name": "RecycleX Operations",
            "location": {"city": "Bangalore", "state": "Karnataka", "postal_code": "560001"},
        },
    },
]

DEMO_MATERIALS = [
    {
        "name": "PET Plastic Bottles (Clear)",
        "code": "PET_PLASTIC_CLEAR",
        "category": "Plastic",
        "unit": "kg",
        "standard_rate": 28.50,
        "co2_offset_factor": 1.5,
        "description": "Clean post-consumer polyethylene terephthalate beverage containers.",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "HDPE Containers (Rigid)",
        "code": "HDPE_PLASTIC_RIGID",
        "category": "Plastic",
        "unit": "kg",
        "standard_rate": 34.00,
        "co2_offset_factor": 1.8,
        "description": "High-density polyethylene containers, milk jugs, detergent bottles.",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Corrugated Cardboard (OCC)",
        "code": "PAPER_CARDBOARD_OCC",
        "category": "Paper",
        "unit": "kg",
        "standard_rate": 14.50,
        "co2_offset_factor": 0.9,
        "description": "Clean dry cardboard packaging boxes.",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Aluminum Beverage Cans",
        "code": "METAL_ALUMINUM_CANS",
        "category": "Metal",
        "unit": "kg",
        "standard_rate": 115.00,
        "co2_offset_factor": 9.0,
        "description": "Used beverage cans (UBC) crushed or loose.",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Electronic Scrap / Printed Circuit Boards",
        "code": "EWASTE_PCB_SCRAP",
        "category": "E-Waste",
        "unit": "kg",
        "standard_rate": 180.00,
        "co2_offset_factor": 14.2,
        "description": "Motherboards, RAM, telecom boards with recoverable precious metals.",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
]


async def seed_database():
    print(f"Connecting to MongoDB Atlas ({MONGODB_DB_NAME}) for seeding...")
    client = AsyncIOMotorClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=8000,
        tlsCAFile=certifi.where(),
    )
    db = client[MONGODB_DB_NAME]

    try:
        # Seed Users & Profiles
        users_col = db["users"]
        profiles_col = db["profiles"]
        materials_col = db["materials"]

        print("Seeding demo users...")
        for u in DEMO_USERS:
            profile_data = u.pop("profile")
            existing = await users_col.find_one({"clerk_user_id": u["clerk_user_id"]})
            if not existing:
                res = await users_col.insert_one(u)
                profile_data["user_id"] = u["clerk_user_id"]
                profile_data["created_at"] = datetime.now(timezone.utc)
                profile_data["updated_at"] = datetime.now(timezone.utc)
                await profiles_col.insert_one(profile_data)
                print(f"  + Created demo user [{u['role']}]: {u['email']}")
            else:
                print(f"  * User {u['email']} already exists.")

        print("Seeding standard recyclable materials...")
        for m in DEMO_MATERIALS:
            existing = await materials_col.find_one({"code": m["code"]})
            if not existing:
                await materials_col.insert_one(m)
                print(f"  + Added material: {m['name']} ({m['code']})")
            else:
                print(f"  * Material {m['code']} already exists.")

        print("Database seeding completed successfully.")

    except Exception as e:
        print(f"Seeding notice: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
