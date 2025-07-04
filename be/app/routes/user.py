from app.utils.auth import get_current_user
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "email": user.get("email"),
        "role": user.get("role"),
    }
