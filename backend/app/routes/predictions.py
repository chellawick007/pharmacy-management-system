from fastapi import APIRouter
from app.database import get_database
from app.services.ml_model import predict_demand

router = APIRouter()

@router.get("/")
async def get_predictions():
    db = get_database()
    sales = await db.sales.find().to_list(10000)
    medicines = await db.medicines.find().to_list(10000)

    stock_by_medicine = {}
    for medicine in medicines:
        medicine_name = medicine.get("name", "").strip().lower()
        if not medicine_name:
            continue
        stock_by_medicine[medicine_name] = stock_by_medicine.get(medicine_name, 0) + int(medicine.get("quantity", 0) or 0)

    if len(sales) < 7:
        return {"message": "Not enough data for predictions (need at least 7 sales)"}

    predictions = predict_demand(sales, stock_by_medicine=stock_by_medicine)
    return predictions