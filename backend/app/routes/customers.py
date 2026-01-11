from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models import Customer, CustomerUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def add_customer(customer: Customer):
    db = get_database()
    
    # Check if phone already exists
    existing = await db.customers.find_one({"phone": customer.phone})
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this phone already exists")
    
    result = await db.customers.insert_one(customer.dict())
    return {"id": str(result.inserted_id), "message": "Customer added successfully"}

@router.get("/")
async def get_customers():
    db = get_database()
    customers = await db.customers.find().sort("created_at", -1).to_list(1000)
    for customer in customers:
        customer["_id"] = str(customer["_id"])
    return customers

@router.get("/{customer_id}")
async def get_customer(customer_id: str):
    db = get_database()
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer["_id"] = str(customer["_id"])
    return customer

@router.put("/{customer_id}")
async def update_customer(customer_id: str, customer: CustomerUpdate):
    db = get_database()
    update_data = {k: v for k, v in customer.dict().items() if v is not None}
    
    result = await db.customers.update_one(
        {"_id": ObjectId(customer_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer updated successfully"}

@router.delete("/{customer_id}")
async def delete_customer(customer_id: str):
    db = get_database()
    result = await db.customers.delete_one({"_id": ObjectId(customer_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer deleted successfully"}

@router.get("/stats/summary")
async def get_customer_stats():
    db = get_database()
    
    total_customers = await db.customers.count_documents({})
    
    # Top customers by purchase amount
    pipeline = [
        {"$sort": {"total_purchases": -1}},
        {"$limit": 5}
    ]
    top_customers = await db.customers.aggregate(pipeline).to_list(5)
    
    for customer in top_customers:
        customer["_id"] = str(customer["_id"])
    
    return {
        "total_customers": total_customers,
        "top_customers": top_customers
    }