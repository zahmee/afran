from datetime import datetime, timedelta, timezone
from typing import Annotated

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.database.db import get_db

ph = PasswordHasher()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return ph.verify(hashed, plain)
    except VerifyMismatchError:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from src.database.models import User

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="بيانات الدخول غير صحيحة",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        sub: str | None = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


CurrentUser = Annotated[object, Depends(get_current_user)]

# ─── توقيت السعودية ────────────────────────────────────
_SA_TZ = timezone(timedelta(hours=3))


def today_sa() -> "date":
    from datetime import date  # noqa: F401
    return datetime.now(_SA_TZ).date()


def check_write_permission(user, record_date) -> None:
    """يرفع 403 إذا لم يكن للمستخدم صلاحية الكتابة على هذا التاريخ."""
    if user.role == "reports":
        raise HTTPException(status_code=403, detail="صلاحية التقارير للاستعراض فقط")
    if user.role == "data_entry" and record_date != today_sa():
        raise HTTPException(status_code=403, detail="مدخل البيانات يملك صلاحية تعديل سجلات اليوم فقط")


def check_delete_permission(user) -> None:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="صلاحية الحذف للمدير فقط")


def check_admin_permission(user) -> None:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك")


def check_not_reports(user) -> None:
    """يسمح للمدير ومدخل البيانات، يرفض صلاحية التقارير."""
    if user.role == "reports":
        raise HTTPException(status_code=403, detail="صلاحية التقارير للاستعراض فقط")
