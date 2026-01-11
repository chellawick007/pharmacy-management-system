from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models import User, UserLogin, UserResponse
import hashlib
import secrets
from datetime import datetime, timedelta

router = APIRouter()

# Simple token storage (In production, use JWT with expiry)
active_tokens = {}

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

@router.post("/signup", response_model=UserResponse)
async def signup(user: User):
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    
    # Insert user
    result = await db.users.insert_one(user_dict)
    
    # Generate token
    token = generate_token()
    active_tokens[token] = {
        "email": user.email,
        "role": user.role,
        "expires": datetime.now() + timedelta(days=7)
    }
    
    return UserResponse(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        token=token
    )

@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if user["password"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    token = generate_token()
    active_tokens[token] = {
        "email": user["email"],
        "role": user["role"],
        "expires": datetime.now() + timedelta(days=7)
    }
    
    return UserResponse(
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
        token=token
    )

@router.post("/logout")
async def logout(token: str):
    if token in active_tokens:
        del active_tokens[token]
    return {"message": "Logged out successfully"}

@router.get("/verify/{token}")
async def verify_token(token: str):
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    token_data = active_tokens[token]
    if datetime.now() > token_data["expires"]:
        del active_tokens[token]
        raise HTTPException(status_code=401, detail="Token expired")
    
    db = get_database()
    user = await db.users.find_one({"email": token_data["email"]})
    
    return {
        "email": user["email"],
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"]
    }