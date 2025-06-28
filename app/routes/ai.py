from fastapi import APIRouter, HTTPException, Depends
from app.schemas import AIQuery, AIResponse
from app.utils.auth import get_current_user
from app.database import insert_data, fetch_data
from uuid import UUID
from datetime import datetime
from app.mock_ai import ask_ai # Pakai LLM dummy dulu, nanti bisa diganti OpenAI/Gemini

router = APIRouter()

@router.post("/consult", response_model=AIResponse)
async def consult_ai(
    payload: AIQuery,
    current_user: dict = Depends(get_current_user)
):
    try:
        answer = await ask_ai(payload.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    record = {
        "user_id": str(current_user["id"]),
        "prompt": payload.prompt,
        "response": answer,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await insert_data("ai_consult_logs", record)
    return result[0]

@router.get("/history", response_model=list[AIResponse])
async def get_ai_history(current_user: dict = Depends(get_current_user)):
    history = await fetch_data("ai_consult_logs", f"&user_id=eq.{current_user['id']}&order=created_at.desc")
    return history
