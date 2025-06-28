#app/routes/auth.py
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from app.schemas import UserRegister, UserLogin, UserOut
from app.database import fetch_data, insert_data
from app.utils.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register", response_model=UserOut)
async def register(user: UserRegister):
    # Cek email sudah ada
    existing = await fetch_data("users", f"&email=eq.{user.email}")
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    data = {
        "name": user.name,
        "email": user.email,
        "password_hash": hashed_password,
        "role": user.role,
    }

    inserted = await insert_data("users", data)
    return inserted[0]

@router.post("/login")
async def login(credentials: UserLogin):
    users = await fetch_data("users", f"&email=eq.{credentials.email}")
    if not users:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = users[0]
    if not pwd_context.verify(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"]
    })

    return {"access_token": token, "token_type": "bearer"}
