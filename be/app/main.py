# app/main.py
from app.routes import ai, auth, ocr, profile, transactions, user
from fastapi import FastAPI

app = FastAPI()

# Include routes
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(user.router, prefix="/users", tags=["User"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(ai.router, prefix="/ai", tags=["AI Konsultan"])
app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])


@app.get("/")
def root():
    return {"message": "FinMate Backend Aktif"}
