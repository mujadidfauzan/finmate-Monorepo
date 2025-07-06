import os
import tempfile
from datetime import date
from pathlib import Path

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
    # Accept more audio formats
    allowed_types = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/m4a",
        "audio/mp4",
        "audio/x-m4a",
        "audio/aac",
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File harus berupa audio yang didukung. Tipe file: {file.content_type}",
        )

    user_id = user["id"]
    tmp_path = None

    try:
        # Get file extension from original filename or content type
        file_extension = None
        if file.filename:
            file_extension = Path(file.filename).suffix
        else:
            # Map content type to extension
            content_type_map = {
                "audio/mpeg": ".mp3",
                "audio/mp3": ".mp3",
                "audio/wav": ".wav",
                "audio/x-wav": ".wav",
                "audio/m4a": ".m4a",
                "audio/mp4": ".m4a",
                "audio/x-m4a": ".m4a",
                "audio/aac": ".aac",
            }
            file_extension = content_type_map.get(file.content_type, ".mp3")

        # Create temporary file with proper extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp:
            # Read and write file content
            file_content = await file.read()
            tmp.write(file_content)
            tmp_path = tmp.name

        # Verify file exists and has content
        if not os.path.exists(tmp_path):
            raise FileNotFoundError(f"Temporary file was not created: {tmp_path}")

        if os.path.getsize(tmp_path) == 0:
            raise ValueError("Uploaded file is empty")

        print(
            f"Processing audio file: {tmp_path} (size: {os.path.getsize(tmp_path)} bytes)"
        )

        # Transcribe audio
        text = transcribe_audio(tmp_path)
        print(f"Transkripsi suara: {text}")

        if not text or text.strip() == "":
            raise ValueError("Tidak ada teks yang dapat ditranskripsi dari audio")

        # Parse with Gemini
        parsed = await parse_transaction_with_gemini(text)
        print(f"Parsed JSON: {parsed}")

        amount = float(parsed.get("amount", 0))
        if amount <= 0:
            raise ValueError(
                "Jumlah tidak valid atau tidak ditemukan dalam transkripsi"
            )

        # Create transaction
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
        print(f"Error processing voice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gagal memproses suara: {str(e)}")

    finally:
        # Clean up temporary file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
                print(f"Cleaned up temporary file: {tmp_path}")
            except Exception as cleanup_error:
                print(f"Failed to cleanup temporary file: {cleanup_error}")
