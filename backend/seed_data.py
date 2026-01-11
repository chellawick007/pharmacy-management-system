#!/usr/bin/env python3
"""
MongoDB Data Seeding Script for Pharmacy Management System
This script populates the database with valid sample data for testing and development.
"""

import asyncio
import sys
import os
import hashlib
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import random

# Database Configuration
# Use environment variable if available (for Docker), otherwise use localhost (for local development)
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "pharmacy_db")

# Password hashing (same method as backend/app/routes/auth.py)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Sample Data
USERS = [
    {
        "email": "admin@pharmacy.com",
        "username": "admin",
        "password": "admin123",  # Will be hashed
        "full_name": "Admin User",
        "role": "admin",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    },
    {
        "email": "pharmacist@pharmacy.com",
        "username": "pharmacist",
        "password": "pharma123",
        "full_name": "John Pharmacist",
        "role": "pharmacist",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    },
    {
        "email": "cashier@pharmacy.com",
        "username": "cashier",
        "password": "cashier123",
        "full_name": "Sarah Cashier",
        "role": "cashier",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
]

MEDICINES = [
    # Antibiotics
    {"name": "Amoxicillin 500mg", "manufacturer": "PharmaCorp", "batch_no": "AMX2024001", "quantity": 150, "price": 12.50, "expiry_date": (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"), "category": "Antibiotics", "reorder_level": 50},
    {"name": "Azithromycin 250mg", "manufacturer": "MediLife", "batch_no": "AZI2024002", "quantity": 8, "price": 18.75, "expiry_date": (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d"), "category": "Antibiotics", "reorder_level": 30},
    {"name": "Ciprofloxacin 500mg", "manufacturer": "HealthPlus", "batch_no": "CIP2024003", "quantity": 95, "price": 15.00, "expiry_date": (datetime.now() + timedelta(days=540)).strftime("%Y-%m-%d"), "category": "Antibiotics", "reorder_level": 40},
    
    # Painkillers
    {"name": "Paracetamol 500mg", "manufacturer": "GenericMed", "batch_no": "PAR2024004", "quantity": 250, "price": 5.00, "expiry_date": (datetime.now() + timedelta(days=730)).strftime("%Y-%m-%d"), "category": "Painkillers", "reorder_level": 100},
    {"name": "Ibuprofen 400mg", "manufacturer": "PainRelief Inc", "batch_no": "IBU2024005", "quantity": 120, "price": 8.50, "expiry_date": (datetime.now() + timedelta(days=450)).strftime("%Y-%m-%d"), "category": "Painkillers", "reorder_level": 60},
    {"name": "Aspirin 75mg", "manufacturer": "CardioHealth", "batch_no": "ASP2024006", "quantity": 180, "price": 6.25, "expiry_date": (datetime.now() + timedelta(days=600)).strftime("%Y-%m-%d"), "category": "Painkillers", "reorder_level": 80},
    
    # Antihistamines
    {"name": "Cetirizine 10mg", "manufacturer": "AllergyFree", "batch_no": "CET2024007", "quantity": 5, "price": 7.50, "expiry_date": (datetime.now() + timedelta(days=20)).strftime("%Y-%m-%d"), "category": "Antihistamines", "reorder_level": 50},
    {"name": "Loratadine 10mg", "manufacturer": "NoSneezeRx", "batch_no": "LOR2024008", "quantity": 85, "price": 9.00, "expiry_date": (datetime.now() + timedelta(days=400)).strftime("%Y-%m-%d"), "category": "Antihistamines", "reorder_level": 45},
    
    # Vitamins
    {"name": "Vitamin D3 1000IU", "manufacturer": "VitaLife", "batch_no": "VD32024009", "quantity": 200, "price": 14.99, "expiry_date": (datetime.now() + timedelta(days=800)).strftime("%Y-%m-%d"), "category": "Vitamins", "reorder_level": 70},
    {"name": "Vitamin C 500mg", "manufacturer": "ImmuneBoost", "batch_no": "VTC2024010", "quantity": 150, "price": 11.50, "expiry_date": (datetime.now() + timedelta(days=700)).strftime("%Y-%m-%d"), "category": "Vitamins", "reorder_level": 60},
    {"name": "Multivitamin Complex", "manufacturer": "DailyHealth", "batch_no": "MUL2024011", "quantity": 3, "price": 22.00, "expiry_date": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"), "category": "Vitamins", "reorder_level": 50},
    
    # Antacids
    {"name": "Omeprazole 20mg", "manufacturer": "GastroRelief", "batch_no": "OME2024012", "quantity": 110, "price": 13.25, "expiry_date": (datetime.now() + timedelta(days=500)).strftime("%Y-%m-%d"), "category": "Antacids", "reorder_level": 50},
    {"name": "Ranitidine 150mg", "manufacturer": "DigestEase", "batch_no": "RAN2024013", "quantity": 75, "price": 10.50, "expiry_date": (datetime.now() + timedelta(days=350)).strftime("%Y-%m-%d"), "category": "Antacids", "reorder_level": 40},
    
    # Cough & Cold
    {"name": "Dextromethorphan Syrup", "manufacturer": "CoughAway", "batch_no": "DEX2024014", "quantity": 60, "price": 16.75, "expiry_date": (datetime.now() + timedelta(days=300)).strftime("%Y-%m-%d"), "category": "Cough & Cold", "reorder_level": 35},
    {"name": "Guaifenesin 400mg", "manufacturer": "RespiClear", "batch_no": "GUA2024015", "quantity": 90, "price": 12.00, "expiry_date": (datetime.now() + timedelta(days=420)).strftime("%Y-%m-%d"), "category": "Cough & Cold", "reorder_level": 45},
    
    # Diabetes
    {"name": "Metformin 500mg", "manufacturer": "DiabetesCare", "batch_no": "MET2024016", "quantity": 6, "price": 19.50, "expiry_date": (datetime.now() + timedelta(days=25)).strftime("%Y-%m-%d"), "category": "Diabetes", "reorder_level": 60},
    {"name": "Glimepiride 2mg", "manufacturer": "SugarControl", "batch_no": "GLI2024017", "quantity": 85, "price": 24.00, "expiry_date": (datetime.now() + timedelta(days=480)).strftime("%Y-%m-%d"), "category": "Diabetes", "reorder_level": 40},
    
    # Hypertension
    {"name": "Amlodipine 5mg", "manufacturer": "HeartHealth", "batch_no": "AML2024018", "quantity": 130, "price": 17.25, "expiry_date": (datetime.now() + timedelta(days=550)).strftime("%Y-%m-%d"), "category": "Hypertension", "reorder_level": 55},
    {"name": "Losartan 50mg", "manufacturer": "BP-Control", "batch_no": "LOS2024019", "quantity": 100, "price": 21.50, "expiry_date": (datetime.now() + timedelta(days=600)).strftime("%Y-%m-%d"), "category": "Hypertension", "reorder_level": 50},
    
    # Dermatology
    {"name": "Clotrimazole Cream", "manufacturer": "SkinCare", "batch_no": "CLO2024020", "quantity": 45, "price": 14.00, "expiry_date": (datetime.now() + timedelta(days=280)).strftime("%Y-%m-%d"), "category": "Dermatology", "reorder_level": 30},
]

CUSTOMERS = [
    {"name": "Rajesh Kumar", "email": "rajesh.kumar@email.com", "phone": "+91-9876543210", "address": "123 MG Road, Bangalore, Karnataka 560001", "created_at": (datetime.now() - timedelta(days=120)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Priya Sharma", "email": "priya.sharma@email.com", "phone": "+91-9876543211", "address": "456 Park Street, Kolkata, West Bengal 700016", "created_at": (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Amit Patel", "email": "amit.patel@email.com", "phone": "+91-9876543212", "address": "789 Station Road, Ahmedabad, Gujarat 380001", "created_at": (datetime.now() - timedelta(days=75)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Sunita Reddy", "email": "sunita.reddy@email.com", "phone": "+91-9876543213", "address": "321 Banjara Hills, Hyderabad, Telangana 500034", "created_at": (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Vikram Singh", "email": "vikram.singh@email.com", "phone": "+91-9876543214", "address": "654 Connaught Place, New Delhi, Delhi 110001", "created_at": (datetime.now() - timedelta(days=45)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Anjali Desai", "email": "anjali.desai@email.com", "phone": "+91-9876543215", "address": "987 Marine Drive, Mumbai, Maharashtra 400002", "created_at": (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Karthik Iyer", "email": "karthik.iyer@email.com", "phone": "+91-9876543216", "address": "147 Anna Salai, Chennai, Tamil Nadu 600002", "created_at": (datetime.now() - timedelta(days=25)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Meera Nair", "email": "meera.nair@email.com", "phone": "+91-9876543217", "address": "258 MG Road, Kochi, Kerala 682016", "created_at": (datetime.now() - timedelta(days=20)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Rohan Mehta", "email": "rohan.mehta@email.com", "phone": "+91-9876543218", "address": "369 FC Road, Pune, Maharashtra 411004", "created_at": (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Divya Krishnan", "email": "divya.krishnan@email.com", "phone": "+91-9876543219", "address": "741 Residency Road, Bangalore, Karnataka 560025", "created_at": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Sanjay Gupta", "email": "sanjay.gupta@email.com", "phone": "+91-9876543220", "address": "852 Hazratganj, Lucknow, Uttar Pradesh 226001", "created_at": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
    {"name": "Pooja Verma", "email": "pooja.verma@email.com", "phone": "+91-9876543221", "address": "963 Civil Lines, Jaipur, Rajasthan 302006", "created_at": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S"), "total_purchases": 0.0},
]


async def seed_database():
    """Main function to seed the database with sample data."""
    
    print("🌱 Starting database seeding process...")
    print(f"📊 Connecting to: {MONGODB_URL}")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB")
        
        # Clear existing collections (optional - comment out if you want to keep existing data)
        print("\n🗑️  Clearing existing collections...")
        await db.users.delete_many({})
        await db.medicines.delete_many({})
        await db.customers.delete_many({})
        await db.sales.delete_many({})
        await db.bills.delete_many({})
        await db.predictions.delete_many({})
        print("✅ Collections cleared")
        
        # Seed Users
        print("\n👥 Seeding users...")
        users_to_insert = []
        for user in USERS:
            user_data = user.copy()
            user_data["password"] = hash_password(user_data["password"])
            users_to_insert.append(user_data)
        
        result = await db.users.insert_many(users_to_insert)
        print(f"✅ Inserted {len(result.inserted_ids)} users")
        print(f"   Login credentials:")
        for user in USERS:
            print(f"   - {user['email']} / {user['password']} ({user['role']})")
        
        # Seed Medicines
        print("\n💊 Seeding medicines...")
        result = await db.medicines.insert_many(MEDICINES)
        medicine_ids = result.inserted_ids
        print(f"✅ Inserted {len(medicine_ids)} medicines")
        
        # Seed Customers
        print("\n🧑 Seeding customers...")
        result = await db.customers.insert_many(CUSTOMERS)
        customer_ids = result.inserted_ids
        print(f"✅ Inserted {len(customer_ids)} customers")
        
        # Seed Sales (last 30 days)
        print("\n📈 Seeding sales data...")
        sales_data = []
        
        # Get inserted medicines with their IDs
        medicines_with_ids = await db.medicines.find().to_list(length=100)
        
        for i in range(50):  # Generate 50 sales records
            days_ago = random.randint(0, 30)
            medicine = random.choice(medicines_with_ids)
            quantity = random.randint(1, 10)
            price = medicine["price"]
            total = quantity * price
            
            sale = {
                "medicine_id": str(medicine["_id"]),
                "medicine_name": medicine["name"],
                "quantity": quantity,
                "price": price,
                "sale_date": (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d"),
                "total": total,
                "user_email": random.choice(USERS)["email"]
            }
            sales_data.append(sale)
        
        result = await db.sales.insert_many(sales_data)
        print(f"✅ Inserted {len(result.inserted_ids)} sales records")
        
        # Seed Bills
        print("\n🧾 Seeding bills...")
        bills_data = []
        
        # Get inserted customers with their IDs
        customers_with_ids = await db.customers.find().to_list(length=100)
        
        for i in range(25):  # Generate 25 bills
            days_ago = random.randint(0, 30)
            customer = random.choice(customers_with_ids)
            
            # Generate 1-4 items per bill
            num_items = random.randint(1, 4)
            items = []
            subtotal = 0.0
            
            for _ in range(num_items):
                medicine = random.choice(medicines_with_ids)
                quantity = random.randint(1, 5)
                price = medicine["price"]
                item_total = quantity * price
                
                items.append({
                    "medicine_id": str(medicine["_id"]),
                    "medicine_name": medicine["name"],
                    "quantity": quantity,
                    "price": price,
                    "total": item_total
                })
                subtotal += item_total
            
            gst_percentage = 18.0
            gst_amount = subtotal * (gst_percentage / 100)
            grand_total = subtotal + gst_amount
            
            bill = {
                "bill_number": f"INV{datetime.now().year}{str(i+1).zfill(5)}",
                "customer_name": customer["name"],
                "customer_phone": customer["phone"],
                "customer_gstin": f"29ABCDE{random.randint(1000, 9999)}F1Z{random.randint(1, 9)}" if random.random() > 0.5 else None,
                "billing_address": customer.get("address"),
                "payment_mode": random.choice(["Cash", "Card", "UPI"]),
                "items": items,
                "subtotal": round(subtotal, 2),
                "gst_percentage": gst_percentage,
                "gst_amount": round(gst_amount, 2),
                "grand_total": round(grand_total, 2),
                "created_at": (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d %H:%M:%S")
            }
            bills_data.append(bill)
        
        result = await db.bills.insert_many(bills_data)
        print(f"✅ Inserted {len(result.inserted_ids)} bills")
        
        # Seed Predictions
        print("\n🔮 Seeding predictions...")
        predictions_data = []
        
        for medicine in medicines_with_ids[:15]:  # Generate predictions for first 15 medicines
            current_stock = medicine["quantity"]
            predicted_demand = random.randint(20, 150)
            confidence = round(random.uniform(0.75, 0.98), 2)
            
            prediction = {
                "medicine_name": medicine["name"],
                "current_stock": current_stock,
                "predicted_demand": predicted_demand,
                "confidence": confidence,
                "date": datetime.now().strftime("%Y-%m-%d")
            }
            predictions_data.append(prediction)
        
        result = await db.predictions.insert_many(predictions_data)
        print(f"✅ Inserted {len(result.inserted_ids)} predictions")
        
        # Create indexes for better performance
        print("\n🔍 Creating indexes...")
        await db.medicines.create_index("name")
        await db.medicines.create_index("category")
        await db.customers.create_index("email")
        await db.customers.create_index("phone")
        await db.users.create_index("email", unique=True)
        await db.sales.create_index("sale_date")
        await db.bills.create_index("bill_number")
        print("✅ Indexes created")
        
        # Summary
        print("\n" + "="*60)
        print("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"📊 Summary:")
        print(f"   👥 Users: {len(USERS)}")
        print(f"   💊 Medicines: {len(MEDICINES)}")
        print(f"   🧑 Customers: {len(CUSTOMERS)}")
        print(f"   📈 Sales: {len(sales_data)}")
        print(f"   🧾 Bills: {len(bills_data)}")
        print(f"   🔮 Predictions: {len(predictions_data)}")
        print("="*60)
        print("\n💡 You can now login with these credentials:")
        print("   Admin: admin@pharmacy.com / admin123")
        print("   Pharmacist: pharmacist@pharmacy.com / pharma123")
        print("   Cashier: cashier@pharmacy.com / cashier123")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        client.close()
        print("\n✅ Database connection closed")


if __name__ == "__main__":
    print("="*60)
    print("     PHARMACY MANAGEMENT SYSTEM - DATA SEEDER")
    print("="*60)
    asyncio.run(seed_database())
