import json
import os
from typing import Dict, List, Optional

import google.generativeai as genai
from app.config import GEMINI_API_KEY
from app.database import fetch_data

genai.configure(api_key=os.getenv(GEMINI_API_KEY))
MODEL_NAME = "gemini-1.5-flash"


def create_chat_session(history=[]):
    model = genai.GenerativeModel(MODEL_NAME)
    return model.start_chat(history=history)


async def get_user_context(user_id: str) -> Dict:
    """Mengambil konteks user dari database untuk membuat AI lebih personal"""
    try:
        # Ambil data transaksi terbaru (30 hari terakhir)
        transactions = await fetch_data(
            "transactions", f"&user_id=eq.{user_id}&order=created_at.desc&limit=20"
        )

        # Ambil data kategori yang sering digunakan
        categories_data = await fetch_data(
            "transactions",
            f"&user_id=eq.{user_id}&select=category&order=created_at.desc&limit=50",
        )

        # Hitung total income dan expense
        total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
        total_expense = sum(t["amount"] for t in transactions if t["type"] == "expense")

        # Kategori yang sering digunakan
        categories = [c["category"] for c in categories_data if c.get("category")]
        common_categories = list(set(categories))[:10]  # 10 kategori teratas

        # Transaksi terbaru
        recent_transactions = transactions[:5]

        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense,
            "common_categories": common_categories,
            "recent_transactions": recent_transactions,
            "transaction_count": len(transactions),
        }
    except Exception as e:
        print(f"Error getting user context: {e}")
        return {}


def create_system_prompt(user_context: Dict) -> str:
    """Membuat system prompt yang disesuaikan dengan data user"""

    balance = user_context.get("balance", 0)
    common_categories = user_context.get("common_categories", [])
    recent_transactions = user_context.get("recent_transactions", [])

    # Format recent transactions untuk context
    recent_tx_text = ""
    if recent_transactions:
        recent_tx_text = "\n".join(
            [
                f"- {tx['type']} Rp{tx['amount']:,.0f} ({tx['category']}) - {tx['note']}"
                for tx in recent_transactions[:3]
            ]
        )

    prompt = f"""
Kamu adalah asisten keuangan personal yang cerdas dan ramah. Berikut adalah informasi tentang pengguna:

KONTEKS KEUANGAN USER:
- Saldo saat ini: Rp{balance:,.0f}
- Total pemasukan: Rp{user_context.get('total_income', 0):,.0f}
- Total pengeluaran: Rp{user_context.get('total_expense', 0):,.0f}
- Jumlah transaksi: {user_context.get('transaction_count', 0)}

KATEGORI YANG SERING DIGUNAKAN:
{', '.join(common_categories) if common_categories else 'Belum ada kategori'}

TRANSAKSI TERBARU:
{recent_tx_text if recent_tx_text else 'Belum ada transaksi'}

INSTRUKSI PERILAKU:
1. Gunakan informasi di atas untuk memberikan saran yang relevan dan personal
2. Panggil user dengan ramah dan berikan insight berdasarkan pola keuangan mereka
3. Jika user menanyakan tentang keuangan, berikan analisis berdasarkan data mereka
4. Sarankan kategori berdasarkan kategori yang sering mereka gunakan
5. Berikan peringatan jika saldo minus atau pengeluaran terlalu tinggi
6. Gunakan bahasa Indonesia yang natural dan ramah
7. Jika diminta menganalisis transaksi, gunakan format JSON seperti biasa
8. Berikan motivasi dan tips keuangan yang sesuai dengan kondisi mereka

Selalu ingat konteks di atas dalam setiap percakapan!
"""

    return prompt


async def ask_gemini_with_history(history: list, message: str, user_id: str = None):
    """Enhanced version dengan konteks user"""
    try:
        # Ambil konteks user jika user_id tersedia
        user_context = {}
        if user_id:
            user_context = await get_user_context(user_id)

        # Buat system prompt dengan konteks user
        system_prompt = create_system_prompt(user_context)

        # Tambahkan system prompt di awal history jika belum ada
        enhanced_history = history.copy()
        if (
            not enhanced_history
            or enhanced_history[0].get("role") != "user"
            or "asisten keuangan"
            not in enhanced_history[0].get("parts", [""])[0].lower()
        ):
            enhanced_history.insert(0, {"role": "user", "parts": [system_prompt]})
            enhanced_history.insert(
                1,
                {
                    "role": "model",
                    "parts": [
                        "Baik, saya siap membantu Anda sebagai asisten keuangan personal yang memahami kondisi keuangan Anda!"
                    ],
                },
            )

        chat = create_chat_session(enhanced_history)
        response = chat.send_message(message)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


async def ask_gemini(prompt: str, user_id: str = None) -> str:
    """Enhanced version dengan konteks user"""
    try:
        # Ambil konteks user jika user_id tersedia
        user_context = {}
        if user_id:
            user_context = await get_user_context(user_id)

        # Buat system prompt dengan konteks user
        system_prompt = create_system_prompt(user_context)

        # Gabungkan system prompt dengan prompt user
        full_prompt = f"{system_prompt}\n\nPERTANYaan USER: {prompt}"

        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


async def parse_transaction_with_gemini(text: str, user_id: str = None):
    """Enhanced version yang menggunakan konteks user untuk parsing yang lebih akurat"""

    # Ambil konteks user untuk kategori yang sering digunakan
    user_context = {}
    if user_id:
        user_context = await get_user_context(user_id)

    common_categories = user_context.get("common_categories", [])
    categories_hint = (
        f"Kategori yang sering digunakan user: {', '.join(common_categories)}"
        if common_categories
        else ""
    )

    prompt = f"""
Kamu adalah sistem keuangan pintar yang memahami kebiasaan user. Dari kalimat berikut ini, ekstrak dalam format output yang akan ditentukan:

{categories_hint}

- jenis transaksi: income / expense
- kategori: (gunakan kategori yang familiar dengan user jika memungkinkan, atau buat kategori baru yang sesuai)
- jumlah uang (tanpa simbol): float
- catatan: ulangi isi kalimat

Contoh output:
{{
  "type": "expense",
  "category": "makan",
  "amount": 12000,
  "note": "makan siang ayam geprek"
}}

PENTING: Berikan output dalam format JSON yang valid!

Kalimat: {text}
"""

    result = await ask_gemini(prompt, user_id)
    print(f"Output Gemini: {result}")

    # Coba ekstrak JSON dari response
    try:
        # Cari JSON block dalam response
        start_idx = result.find("{")
        end_idx = result.rfind("}") + 1
        if start_idx != -1 and end_idx != -1:
            json_str = result[start_idx:end_idx]
            return json.loads(json_str)
        else:
            return json.loads(result)
    except:
        raise ValueError("Output Gemini tidak bisa di-decode sebagai JSON.")
