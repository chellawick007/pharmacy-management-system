from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv

MONGODB_URL = getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = getenv("DATABASE_NAME", "pharmacy_db")

client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    print("✅ Connected to MongoDB")

async def close_db():
    global client
    if client:
        client.close()
        print("❌ Closed MongoDB connection")

def get_database():
    return db