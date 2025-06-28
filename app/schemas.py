# app/schemas.py
import uuid
from datetime import date
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


class TransactionCreate(BaseModel):
    user_id: uuid.UUID
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

class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: str
    family_id: Optional[UUID]

    model_config = {
    "from_attributes": True
}


class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]