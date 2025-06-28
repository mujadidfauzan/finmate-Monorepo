# app/schemas.py
import uuid
from datetime import date
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime


class TransactionCreate(BaseModel):
    amount: float
    type: str = Field(..., pattern="^(income|expense)$")
    category: str
    method: str = Field(..., pattern="^(manual|voice|ocr)$")
    note: Optional[str]
    transaction_date: date


class TransactionUpdate(BaseModel):
    amount: Optional[float]
    type: Optional[str] = Field(None, pattern="^(income|expense)$")
    category: Optional[str]
    method: Optional[str] = Field(None, pattern="^(manual|voice|ocr)$")
    note: Optional[str]
    transaction_date: Optional[date]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: str
    family_id: Optional[UUID]

    model_config = {
    "from_attributes": True
}
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]


class AIQuery(BaseModel):
    prompt: str

class AIResponse(BaseModel):
    id: UUID
    user_id: UUID
    prompt: str
    response: str
    created_at: datetime