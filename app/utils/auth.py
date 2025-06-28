from app.config import SUPABASE_JWT_SECRET
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from app.database import fetch_data  # ✅ penting
from uuid import UUID

security_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no sub")

        # ✅ Ambil data user dari Supabase table `users`
        user_data = await fetch_data("users", f"&id=eq.{user_id}")
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        return user_data[0]  # ini sudah dict lengkap
    except JWTError as e:
        print("JWT error:", str(e))
        raise HTTPException(status_code=401, detail="Token tidak valid")
