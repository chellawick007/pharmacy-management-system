from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.routes import medicines, sales, predictions, auth, customers, billing, reports, notifications, suppliers, purchase_orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up...")
    await connect_db()
    yield
    print("🛑 Shutting down...")
    await close_db()

app = FastAPI(title="Smart Pharmacy API", version="1.0.0", lifespan=lifespan)

# CORS Configuration - Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(medicines.router, prefix="/api/medicines", tags=["Medicines"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(purchase_orders.router, prefix="/api/purchase-orders", tags=["Purchase Orders"])

@app.get("/")
async def root():
    return {"message": "Smart Pharmacy API", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {
        "message": "Smart Pharmacy API is running!",
        "status": "ok",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/test")
async def test():
    from app.database import get_database
    try:
        db = get_database()
        collections = await db.list_collection_names()
        return {
            "status": "connected",
            "database": "pharmacy_db",
            "collections": collections
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }