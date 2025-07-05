# app/routes/ocr.py

import json
import logging
import os
import tempfile
from datetime import date
from typing import Optional

from app.ai_models.donut_loader import predict_from_image_path
from app.database import insert_data
from app.utils.auth import get_current_user
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/scan-struk")
async def scan_struk(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Endpoint untuk scan struk menggunakan OCR

    Args:
        file: Image file (JPG/PNG)
        user: Current authenticated user
        db: Database connection

    Returns:
        JSON response with extracted data and saved transaction
    """

    # Validate file type
    if not file.content_type or file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/jpg",
    ]:
        raise HTTPException(status_code=400, detail="File harus berupa JPG/PNG")

    # Validate file size (max 10MB)
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail="Ukuran file terlalu besar (maksimal 10MB)"
        )

    temp_file_path = None

    try:
        # Read file contents
        contents = await file.read()

        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name

        logger.info(f"Processing image: {file.filename}, size: {len(contents)} bytes")

        # Process image with OCR
        ocr_result = predict_from_image_path(temp_file_path)

        # Check if OCR failed
        if "error" in ocr_result:
            raise HTTPException(
                status_code=500, detail=f"Gagal memproses struk: {ocr_result['error']}"
            )

        # Extract data with fallbacks
        user_id = user["id"]
        amount = float(ocr_result.get("total", 0))
        category = ocr_result.get("category", "lainnya")
        trans_date = ocr_result.get("date") or str(date.today())
        note = ocr_result.get("note", "Hasil OCR struk")

        # Validate amount
        if amount <= 0:
            logger.warning("Amount extracted is 0 or negative")
            # Don't fail, but warn user

        # Prepare transaction data
        transaction_data = {
            "user_id": user_id,
            "amount": amount,
            "type": "expense",  # Receipt scanning is typically for expenses
            "category": category,
            "method": "ocr",
            "note": note,
            "transaction_date": trans_date,
            "created_at": str(date.today()),
        }

        # Save transaction to database
        try:
            save_result = await insert_data("transactions", transaction_data)
            logger.info(f"Transaction saved successfully: {save_result}")
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            # Return OCR result even if database save fails
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Struk berhasil diproses, tapi gagal menyimpan ke database",
                    "extracted": ocr_result,
                    "warning": "Data tidak tersimpan ke database",
                    "db_error": str(db_error),
                },
            )

        # Return success response
        return JSONResponse(
            status_code=200,
            content={
                "message": "Transaksi berhasil dibuat dari struk",
                "extracted": {
                    "total": amount,
                    "category": category,
                    "date": trans_date,
                    "note": note,
                    "items": ocr_result.get("items", []),
                    "raw_ocr": ocr_result.get("raw_ocr", ""),
                },
                "transaction": {
                    "id": save_result.get("id") if save_result else None,
                    "amount": amount,
                    "category": category,
                    "date": trans_date,
                },
            },
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gagal memproses struk: {str(e)}")

    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup temp file: {cleanup_error}")
