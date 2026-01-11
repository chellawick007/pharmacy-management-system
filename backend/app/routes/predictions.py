from fastapi import APIRouter
from app.database import get_database
from app.services.ml_model import predict_demand

router = APIRouter()

@router.get("/")
async def get_predictions():
    db = get_database()
    sales = await db.sales.find().to_list(10000)
    
    if len(sales) < 7:
        return {"message": "Not enough data for predictions (need at least 7 sales)"}
    
    predictions = predict_demand(sales)
    return predictions