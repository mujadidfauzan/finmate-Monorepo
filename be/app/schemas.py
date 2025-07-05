# app/schemas.py
import uuid
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class TransactionCreate(BaseModel):
    amount: float
    type: str = Field(..., pattern="^(income|expense|budget|savings_plan|savings)$")
    category: str
    method: str = Field(..., pattern="^(manual|voice|ocr|system)$")
    note: Optional[str]
    transaction_date: date


class TransactionUpdate(BaseModel):
    amount: Optional[float]
    type: Optional[str] = Field(None, pattern="^(income|expense|budget|savings_plan|savings)$")
    category: Optional[str]
    method: Optional[str] = Field(None, pattern="^(manual|voice|ocr|system)$")
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

    model_config = {"from_attributes": True}


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


class Message(BaseModel):
    role: str  # "user" or "model"
    content: str


class ChatRequest(BaseModel):
    session_id: UUID
    message: str
