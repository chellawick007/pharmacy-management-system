from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models import Bill
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_bill(bill: Bill):
    db = get_database()
    
    # Validate and update stock for each item
    for item in bill.items:
        medicine = await db.medicines.find_one({"_id": ObjectId(item.medicine_id)})
        
        if not medicine:
            raise HTTPException(status_code=404, detail=f"Medicine {item.medicine_name} not found")
        
        if medicine["quantity"] < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {item.medicine_name}! Available: {medicine['quantity']}, Requested: {item.quantity}"
            )
        
        # Reduce stock
        await db.medicines.update_one(
            {"_id": ObjectId(item.medicine_id)},
            {"$inc": {"quantity": -item.quantity}}
        )
    
    # Insert bill
    result = await db.bills.insert_one(bill.dict())
    
    return {
        "id": str(result.inserted_id),
        "bill_number": bill.bill_number,
        "message": "Bill created successfully"
    }

@router.get("/")
async def get_bills():
    db = get_database()
    bills = await db.bills.find().sort("created_at", -1).to_list(1000)
    for bill in bills:
        bill["_id"] = str(bill["_id"])
    return bills

@router.get("/{bill_id}")
async def get_bill(bill_id: str):
    db = get_database()
    bill = await db.bills.find_one({"_id": ObjectId(bill_id)})
    
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    bill["_id"] = str(bill["_id"])
    return bill

@router.delete("/{bill_id}")
async def delete_bill(bill_id: str):
    db = get_database()
    
    # Find the bill first
    bill = await db.bills.find_one({"_id": ObjectId(bill_id)})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Restore stock for each item
    for item in bill["items"]:
        await db.medicines.update_one(
            {"_id": ObjectId(item["medicine_id"])},
            {"$inc": {"quantity": item["quantity"]}}
        )
    
    # Delete the bill
    await db.bills.delete_one({"_id": ObjectId(bill_id)})
    
    return {"message": "Bill deleted successfully"}

@router.get("/stats/summary")
async def get_bill_stats():
    db = get_database()
    bills = await db.bills.find().to_list(10000)
    
    total_bills = len(bills)
    total_revenue = sum(bill.get("grand_total", 0) for bill in bills)
    avg_bill_value = total_revenue / total_bills if total_bills > 0 else 0
    
    return {
        "total_bills": total_bills,
        "total_revenue": total_revenue,
        "avg_bill_value": avg_bill_value
    }
