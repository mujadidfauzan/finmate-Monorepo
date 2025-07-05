from typing import List
from uuid import UUID

from app.ai_models.gemini_client import ask_gemini_with_history
from app.database import delete_data, fetch_data, insert_data
from app.schemas import ChatRequest, Message
from app.utils.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


@router.post("/chatbot/session")
async def get_or_create_session(user=Depends(get_current_user)):
    user_id = user["id"]
    sessions = await fetch_data("chat_sessions", f"&user_id=eq.{user_id}")
    if sessions:
        return {"session_id": sessions[0]["id"]}

    new_session = await insert_data("chat_sessions", {"user_id": user_id})
    return {"session_id": new_session[0]["id"]}


@router.get("/chatbot/history/{session_id}")
async def get_chat_history(session_id: UUID, user=Depends(get_current_user)):
    messages = await fetch_data(
        "chat_messages", f"&session_id=eq.{session_id}&order=created_at.asc"
    )
    return {"history": messages}


@router.post("/chatbot/message")
async def send_message(req: ChatRequest, user=Depends(get_current_user)):
    session_id = str(req.session_id)
    user_id = user["id"]  # Ambil user_id untuk konteks

    # Ambil history chat
    messages = await fetch_data(
        "chat_messages", f"&session_id=eq.{session_id}&order=created_at.asc"
    )
    history = [{"role": m["role"], "parts": [m["content"]]} for m in messages]

    # Kirim pesan dengan konteks user
    reply = await ask_gemini_with_history(history, req.message, user_id)

    # Simpan pesan user
    await insert_data(
        "chat_messages",
        {"session_id": session_id, "role": "user", "content": req.message},
    )

    # Simpan reply AI
    await insert_data(
        "chat_messages", {"session_id": session_id, "role": "model", "content": reply}
    )

    return {"reply": reply}


@router.delete("/chatbot/session/{session_id}")
async def delete_chat_session(session_id: UUID, user=Depends(get_current_user)):
    user_id = user["id"]  # Perbaiki dari user["user_id"] ke user["id"]

    session_data = await fetch_data(
        "chat_sessions", f"&id=eq.{session_id}&user_id=eq.{user_id}"
    )
    if not session_data:
        raise HTTPException(
            status_code=404, detail="Session tidak ditemukan atau bukan milik Anda"
        )

    result = await delete_data("chat_sessions", str(session_id))

    return result
