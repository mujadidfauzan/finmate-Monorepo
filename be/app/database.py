# app/services/supabase_service.py

import datetime
import json
import uuid

import httpx
from app.config import SUPABASE_KEY, SUPABASE_URL
from fastapi import HTTPException

# Headers global
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


# Encoder untuk UUID dan tanggal
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid.UUID):
            return str(obj)
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        return super().default(obj)


# Fetch data
async def fetch_data(table: str, filters: str = "", order_by: str = ""):
    async with httpx.AsyncClient() as client:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select=*" + filters
        if order_by:
            url += f"&order={order_by}"
        res = await client.get(url, headers=headers)
        return res.json()


# Insert data
async def insert_data(table: str, data: dict):
    headers_with_prefer = headers.copy()
    headers_with_prefer["Prefer"] = "return=representation"

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=headers_with_prefer,
            content=json.dumps(data, cls=CustomJSONEncoder),
        )
        
        # Proper error handling based on status code
        if res.status_code >= 400:
            try:
                detail = res.json()
            except json.JSONDecodeError:
                detail = res.text
            raise HTTPException(status_code=res.status_code, detail=detail)

        if res.text:
            return res.json()
        return {"message": "Insert successful", "status": res.status_code}


# Update data
async def update_data(table: str, id: str, data: dict):
    headers_with_prefer = headers.copy()
    headers_with_prefer["Prefer"] = "return=representation"

    async with httpx.AsyncClient() as client:
        url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id}"
        res = await client.patch(
            url,
            headers=headers_with_prefer,
            content=json.dumps(data, cls=CustomJSONEncoder),
        )
        if res.text:
            return res.json()
        return {"message": "Update successful", "status": res.status_code}


# Delete data
async def delete_data(table: str, id: str):
    async with httpx.AsyncClient() as client:
        url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id}"
        res = await client.delete(url, headers=headers)
        if res.status_code == 204:
            return {"ok": True, "message": "Transaksi berhasil dihapus"}
        try:
            return res.json()
        except:
            return {
                "ok": False,
                "message": "Gagal menghapus",
                "status": res.status_code,
            }
