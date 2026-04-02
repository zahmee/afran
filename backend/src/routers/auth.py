from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.auth import (
    CurrentUser,
    create_access_token,
    hash_password,
    verify_password,
)
from src.database.db import get_db
from src.database.models import Payment, Supplier, User
from src.models.auth import (
    CreateUserRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateUserRequest,
    UserResponse,
)

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
            detail="الحساب غير مفعّل — يرجى التواصل مع المدير",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="اسم المستخدم مسجل مسبقاً")

    user = User(
        username=body.username.strip(),
        password_hash=hash_password(body.password),
        full_name=body.full_name.strip(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(user: CurrentUser):
    return user


# ─── إدارة المستخدمين (للمدير فقط) ────────────────────

@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    body: CreateUserRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك")

    dup = await db.execute(select(User).where(User.username == body.username))
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="اسم المستخدم مسجل مسبقاً")

    new_user = User(
        username=body.username.strip(),
        password_hash=hash_password(body.password),
        full_name=body.full_name.strip(),
        role=body.role,
        is_active=body.is_active,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.get("/users", response_model=list[UserResponse])
async def list_users(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك")
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    body: UpdateUserRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك")

    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    if body.full_name is not None:
        target.full_name = body.full_name.strip()
    if body.username is not None:
        dup = await db.execute(
            select(User).where(User.username == body.username, User.id != user_id)
        )
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="اسم المستخدم مسجل مسبقاً")
        target.username = body.username.strip()
    if body.password is not None:
        target.password_hash = hash_password(body.password)
    if body.role is not None:
        target.role = body.role
    if body.is_active is not None:
        target.is_active = body.is_active

    await db.commit()
    await db.refresh(target)
    return target


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك")
    if user.id == user_id:
        raise HTTPException(status_code=400, detail="لا يمكنك حذف حسابك")

    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    await db.delete(target)
    await db.commit()


@router.post("/seed", response_model=UserResponse, include_in_schema=False)
async def seed_admin(db: AsyncSession = Depends(get_db)):
    """Create default admin user if none exists."""
    result = await db.execute(select(User).where(User.username == "admin"))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="المستخدم الافتراضي موجود مسبقاً")

    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        full_name="مدير النظام",
        role="admin",
        is_active=True,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


@router.post("/seed-payments", include_in_schema=False)
async def seed_payments(db: AsyncSession = Depends(get_db)):
    """بذر بيانات سدادات نموذجية إذا لم تكن موجودة."""
    existing = (await db.scalar(select(func.count()).select_from(Payment))) or 0
    if existing:
        raise HTTPException(status_code=400, detail="بيانات السدادات موجودة مسبقاً")

    result = await db.execute(select(Supplier).limit(3))
    suppliers_list = result.scalars().all()
    if not suppliers_list:
        raise HTTPException(status_code=400, detail="لا يوجد موردون — أضف موردين أولاً")

    admin = await db.scalar(select(User).where(User.username == "admin"))
    if not admin:
        raise HTTPException(status_code=400, detail="المستخدم الافتراضي غير موجود")

    today = date.today()
    sample_payments = []
    for i, supplier in enumerate(suppliers_list):
        sample_payments.append(Payment(
            supplier_id=supplier.id,
            payment_date=today,
            payment_time=f"{9 + i:02d}:00",
            amount=Decimal(str(500 * (i + 1))),
            notes=f"سداد نموذجي رقم {i + 1}",
            created_by=admin.id,
        ))

    db.add_all(sample_payments)
    await db.commit()
    return {"seeded": len(sample_payments)}
