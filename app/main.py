# app/main.py
from app.routes import transactions
from fastapi import FastAPI

app = FastAPI()

# Include routes
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])


@app.get("/")
def root():
    return {"message": "FinMate Backend Aktif"}
