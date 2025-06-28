# app/routes/transactions.py
from typing import Optional

from app.database import delete_data, fetch_data, insert_data, update_data
from app.schemas import TransactionCreate, TransactionUpdate
from fastapi import APIRouter, HTTPException

router = APIRouter()


# Membuat transaksi baru
@router.post("/create")
async def create_transaction(trans: TransactionCreate):
    result = await insert_data("transactions", trans.dict())
    if "code" in result:
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Transaksi berhasil ditambahkan", "data": result}


# Mendapatkan daftar transaksi berdasarkan user_id, tipe, kategori, tanggal, dan jenis transaksi
@router.get("/")
async def get_transactions(
    user_id: str,
    type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    filters = f"&user_id=eq.{user_id}"

    if type:
        filters += f"&type=eq.{type}"
    if category:
        filters += f"&category=eq.{category}"
    if start_date:
        filters += f"&transaction_date=gte.{start_date}"
    if end_date:
        filters += f"&transaction_date=lte.{end_date}"

    data = await fetch_data("transactions", filters)
    return {"data": data}


# Mendapatkan detail transaksi berdasarkan ID transaksi
@router.get("/{id}")
async def get_transaction_detail(id: str):
    filters = f"&id=eq.{id}"
    data = await fetch_data("transactions", filters)

    if not data:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")

    return {"data": data[0]}


# Memperbarui transaksi berdasarkan ID transaksi
@router.put("/{id}")
async def update_transaction(id: str, trans: TransactionUpdate):
    update_payload = trans.dict(exclude_unset=True)
    if not update_payload:
        raise HTTPException(status_code=400, detail="Tidak ada data yang diberikan")

    result = await update_data("transactions", id, update_payload)

    if "code" in result:
        raise HTTPException(status_code=400, detail=result)
    if not result or (isinstance(result, list) and len(result) == 0):
        raise HTTPException(
            status_code=404, detail="Transaksi tidak ditemukan atau tidak diubah"
        )

    return {"message": "Transaksi berhasil diperbarui", "data": result}


# Menghapus transaksi berdasarkan ID transaksi
@router.delete("/{id}")
async def delete_transaction(id: str):
    result = await delete_data("transactions", id)
    return result
