# app/schemas.py
import uuid
from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


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
