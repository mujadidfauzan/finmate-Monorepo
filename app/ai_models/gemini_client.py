import json
import os

import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-1.5-flash"


def create_chat_session(history=[]):
    model = genai.GenerativeModel(MODEL_NAME)
    return model.start_chat(history=history)


def ask_gemini_with_history(history: list, message: str):
    try:
        chat = create_chat_session(history)
        response = chat.send_message(message)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


def ask_gemini(prompt: str) -> str:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


def parse_transaction_with_gemini(text: str):
    prompt = f"""
Kamu adalah sistem keuangan pintar. Dari kalimat berikut ini, ekstrak dan kembalikan sebagai JSON:
- jenis transaksi: income / expense
- kategori: (contoh: makan, transportasi, gaji)
- jumlah uang (tanpa simbol): float
- catatan: ulangi isi kalimat

Contoh output:
{{
  "type": "expense",
  "category": "makan",
  "amount": 12000,
  "note": "makan siang ayam geprek"
}}

Kalimat: {text}
"""

    result = ask_gemini(prompt)
    try:
        return json.loads(result)
    except:
        raise ValueError("Output Gemini tidak bisa di-decode sebagai JSON.")
