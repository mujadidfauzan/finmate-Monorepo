# app/routes/ocr.py

import json
from datetime import date

# from app.ai_models.donut_loader import predict_from_image_path
# from app.database import get_current_user
# from app.utils.auth import get_current_user
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

router = APIRouter()


@router.post("/scan-struk")
async def scan_struk(file: UploadFile = File(...)):
    # if file.content_type not in ["image/jpeg", "image/png"]:
    #     raise HTTPException(status_code=400, detail="File harus berupa JPG/PNG")

    # contents = await file.read()

    # try:
    #     result_text = predict_from_image_path(contents)
    #     result = json.loads(result_text)  # hasil dari Donut berupa JSON string

    #     # Ekstrak data penting
    #     user_id = user["user_id"]
    #     amount = float(result.get("total", 0))
    #     category = result.get("category", "lainnya")
    #     trans_date = result.get("date", str(date.today()))  # fallback = hari ini
    #     note = result.get("note", "Hasil OCR struk")

    #     # Simpan transaksi otomatis
    #     transaction_data = {
    #         "user_id": user_id,
    #         "amount": amount,
    #         "type": "expense",
    #         "category": category,
    #         "method": "ocr",
    #         "note": note,
    #         "transaction_date": trans_date,
    #     }

    #     save_result = await insert_data("transactions", transaction_data)

    return {
        "message": "Transaksi berhasil dibuat dari struk",
        # "extracted": result,
        # "inserted": save_result,
    }


# except Exception as e:
#     raise HTTPException(status_code=500, detail=f"Gagal memproses struk: {str(e)}")
