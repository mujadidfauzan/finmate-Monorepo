import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Konfigurasi API key dari environment variable
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Buat instance model Gemini
model = genai.GenerativeModel("gemini-pro")

# Fungsi async untuk memanggil Gemini
async def ask_ai(prompt: str) -> str:
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"[Gemini Error] {str(e)}"
