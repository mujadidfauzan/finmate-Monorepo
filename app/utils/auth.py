from app.config import SUPABASE_JWT_SECRET
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

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
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role"),
        }
    except JWTError as e:
        print("JWT error:", str(e))
        raise HTTPException(status_code=401, detail="Token tidak valid")
