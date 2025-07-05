from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app import schemas
from app.utils.auth import get_current_user
from app.database import fetch_data, update_data

router = APIRouter()

@router.get("/", response_model=schemas.UserOut)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/profile/update", response_model=schemas.UserOut)
async def update_profile(
    updates: schemas.UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    update_fields = {}
    if updates.name:
        update_fields["name"] = updates.name
    if updates.email:
        update_fields["email"] = updates.email

    if not update_fields:
        raise HTTPException(status_code=400, detail="No updates provided")

    updated_user = await update_data("users", str(current_user["id"]), update_fields)
    return updated_user[0] 


@router.post("/family/join", response_model=schemas.UserOut)
async def join_family(
    family_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    families = await fetch_data("families", f"&id=eq.{family_id}")
    if not families:
        raise HTTPException(status_code=404, detail="Family not found")

    updated_user = await update_data("users", str(current_user["id"]), {"family_id": str(family_id)})
    return updated_user[0]


@router.post("/family/leave", response_model=schemas.UserOut)
async def leave_family(
    current_user: dict = Depends(get_current_user),
):
    updated_user = await update_data("users", str(current_user["id"]), {"family_id": None})
    return updated_user[0]
