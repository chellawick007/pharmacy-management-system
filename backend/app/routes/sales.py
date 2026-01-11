from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models import Sale
from bson import ObjectId

router = APIRouter()

@router.post("/")
async def add_sale(sale: Sale):
    db = get_database()
    
    # Check if medicine exists and has enough quantity
    medicine = await db.medicines.find_one({"_id": ObjectId(sale.medicine_id)})
    
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    if medicine["quantity"] < sale.quantity:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient stock! Available: {medicine['quantity']}, Requested: {sale.quantity}"
        )
    
    # Reduce stock
    await db.medicines.update_one(
        {"_id": ObjectId(sale.medicine_id)},
        {"$inc": {"quantity": -sale.quantity}}
    )
    
    result = await db.sales.insert_one(sale.dict())
    return {"id": str(result.inserted_id), "message": "Sale recorded successfully"}

@router.get("/")
async def get_sales():
    db = get_database()
    sales = await db.sales.find().sort("sale_date", -1).to_list(1000)
    for sale in sales:
        sale["_id"] = str(sale["_id"])
    return sales

@router.get("/summary")
async def get_sales_summary():
    db = get_database()
    pipeline = [
        {
            "$group": {
                "_id": "$medicine_name",
                "total_quantity": {"$sum": "$quantity"},
                "total_revenue": {"$sum": "$total"},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"total_revenue": -1}}
    ]
    summary = await db.sales.aggregate(pipeline).to_list(100)
    return summary