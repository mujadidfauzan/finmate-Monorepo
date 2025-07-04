from datetime import datetime
from uuid import UUID

from app.database import fetch_data, insert_data
from app.schemas import AIQuery, AIResponse
from app.utils.auth import get_current_user
from app.utils.gemini import ask_ai
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/ai", tags=["AI Consultant"])


@router.post("/consult", response_model=AIResponse, summary="Konsultasi ke AI")
async def consult_ai(payload: AIQuery, current_user: dict = Depends(get_current_user)):
    """
    Mengirim prompt ke AI dan menyimpan hasilnya ke log pengguna.
    """
    try:
        # Panggil AI (dummy/gemini/openai)
        answer = await ask_ai(payload.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    # Simpan hasil konsultasi ke database
    record = {
        "user_id": str(current_user["id"]),
        "prompt": payload.prompt,
        "response": answer,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = await insert_data("ai_consult_logs", record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")

    return result[0]  # kembalikan item pertama sebagai hasil response


@router.get(
    "/history", response_model=list[AIResponse], summary="Riwayat Konsultasi AI"
)
async def get_ai_history(current_user: dict = Depends(get_current_user)):
    """
    Mengambil semua riwayat konsultasi AI milik user saat ini.
    """
    try:
        history = await fetch_data(
            "ai_consult_logs", f"&user_id=eq.{current_user['id']}&order=created_at.desc"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")

    return history
