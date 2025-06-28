import os
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.database import fetch_data  
from app.config import SUPABASE_KEY, SUPABASE_URL

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        
        users = await fetch_data("users", f"&email=eq.{email}")
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        return users[0]  

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
