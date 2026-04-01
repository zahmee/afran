from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.auth import (
    CurrentUser,
    create_access_token,
    hash_password,
    verify_password,
)
from src.database.db import get_db
from src.database.models import User
from src.models.auth import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="اسم المستخدم أو كلمة المرور غير صحيحة",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="الحساب معطل",
        )

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(user: CurrentUser):
    return user


@router.post("/seed", response_model=UserResponse, include_in_schema=False)
async def seed_admin(db: AsyncSession = Depends(get_db)):
    """Create default admin user if none exists. Remove in production."""
    result = await db.execute(select(User).where(User.username == "admin"))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="المستخدم الافتراضي موجود مسبقاً")

    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        full_name="مدير النظام",
        role="admin",
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin
