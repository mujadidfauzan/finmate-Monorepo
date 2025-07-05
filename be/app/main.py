# app/main.py
from app.routes import auth, chat, ocr, profile, transactions, user, voice
from fastapi import FastAPI

app = FastAPI()

# Include routes
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(user.router, prefix="/users", tags=["User"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/chat", tags=["AI Konsultan"])
app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
app.include_router(voice.router, prefix="/voice", tags=["Voice Input"])


@app.get("/")
def root():
    return {"message": "FinMate Backend Aktif"}
