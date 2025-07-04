import tempfile
from datetime import date

from app.ai_models.gemini_client import parse_transaction_with_gemini
from app.ai_models.whisper_model import transcribe_audio
from app.database import insert_data
from app.utils.auth import get_current_user
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

router = APIRouter()


@router.post("/transcribe-voice")
async def transcribe_voice(
    file: UploadFile = File(...), user=Depends(get_current_user)
):
    if file.content_type not in ["audio/mpeg", "audio/wav", "audio/x-wav"]:
        raise HTTPException(
            status_code=400, detail="File harus berupa audio (mp3, wav)"
        )

    user_id = user["user_id"]

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # 1. Transkripsi dengan Whisper
        text = transcribe_audio(tmp_path)

        # 2. Parsing ke Gemini
        parsed = parse_transaction_with_gemini(text)

        # Validasi hasil Gemini
        amount = float(parsed.get("amount", 0))
        if amount <= 0:
            raise ValueError("Jumlah tidak valid")

        # 3. Simpan sebagai transaksi
        trans = {
            "user_id": user_id,
            "amount": amount,
            "type": parsed.get("type", "expense"),
            "category": parsed.get("category", "lainnya"),
            "method": "voice",
            "note": parsed.get("note", text),
            "transaction_date": str(date.today()),
        }

        saved = await insert_data("transactions", trans)

        return {
            "message": "Transaksi suara berhasil disimpan",
            "note": text,
            "parsed": parsed,
            "inserted": saved,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses suara: {str(e)}")
