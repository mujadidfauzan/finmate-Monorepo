# app/main.py
from app.routes import transactions, profile
from fastapi import FastAPI

app = FastAPI()

# Include routes
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])

app.include_router(profile.router, prefix="/profile", tags=["Profile"])

@app.get("/")
def root():
    return {"message": "FinMate Backend Aktif"}
