from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    role: str = "pharmacist"  # admin, pharmacist, cashier
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    email: str
    username: str
    full_name: str
    role: str
    token: str

class Medicine(BaseModel):
    name: str
    batch_no: str
    quantity: int
    price: float
    expiry_date: str
    category: str
    reorder_level: int = 50

class Sale(BaseModel):
    medicine_id: str
    medicine_name: str
    quantity: int
    price: float
    sale_date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    total: float
    user_email: Optional[str] = None

class Prediction(BaseModel):
    medicine_name: str
    predicted_demand: float
    confidence: float
    date: str

class Customer(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    total_purchases: float = 0.0
    last_purchase_date: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class BillItem(BaseModel):
    medicine_id: str
    medicine_name: str
    quantity: int
    price: float
    total: float

class Bill(BaseModel):
    bill_number: str
    customer_name: str
    customer_phone: Optional[str] = None
    customer_gstin: Optional[str] = None  # GST Identification Number
    billing_address: Optional[str] = None  # Customer billing address
    payment_mode: str  # Cash, Card, UPI
    items: list[BillItem]
    subtotal: float
    gst_percentage: float = 18.0
    gst_amount: float
    grand_total: float
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))