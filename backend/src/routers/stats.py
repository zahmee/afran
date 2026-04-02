from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.auth import CurrentUser
from src.database.db import get_db
from src.database.models import GoodsReceipt, Payment, Supplier, SupplierReturn

router = APIRouter(prefix="/stats", tags=["stats"])


class MonthlyPoint(BaseModel):
    month: str      # "يناير", "فبراير", ...
    receipts: float
    payments: float
    returns: float


class DashboardStats(BaseModel):
    today_receipts: float        # إجمالي البضاعة المستلمة اليوم
    today_payments: float        # إجمالي السدادات اليوم
    total_suppliers: int         # عدد الموردين النشطين
    total_returns: float         # إجمالي قيمة المرتجعات الكلي
    monthly: list[MonthlyPoint]  # آخر 6 أشهر


MONTH_AR = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard_stats(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    today = date.today()

    # ─── بضاعة اليوم ──────────────────────────────────────
    today_receipts: Decimal = (await db.scalar(
        select(func.coalesce(func.sum(GoodsReceipt.total_amount), Decimal("0")))
        .where(GoodsReceipt.receipt_date == today)
    )) or Decimal("0")

    # ─── سدادات اليوم ─────────────────────────────────────
    today_payments: Decimal = (await db.scalar(
        select(func.coalesce(func.sum(Payment.amount), Decimal("0")))
        .where(Payment.payment_date == today)
    )) or Decimal("0")

    # ─── عدد الموردين النشطين ──────────────────────────────
    total_suppliers: int = (await db.scalar(
        select(func.count()).select_from(Supplier).where(Supplier.is_active == True)
    )) or 0

    # ─── إجمالي المرتجعات ─────────────────────────────────
    total_returns: Decimal = (await db.scalar(
        select(func.coalesce(func.sum(SupplierReturn.total_amount), Decimal("0")))
    )) or Decimal("0")

    # ─── آخر 6 أشهر ───────────────────────────────────────
    monthly: list[MonthlyPoint] = []

    for i in range(5, -1, -1):
        # حساب السنة والشهر المستهدف
        target = today.replace(day=1) - timedelta(days=1)
        for _ in range(i):
            target = target.replace(day=1) - timedelta(days=1)
        if i == 0:
            target = today

        year = today.year
        month_num = today.month - i
        while month_num <= 0:
            month_num += 12
            year -= 1

        r: Decimal = (await db.scalar(
            select(func.coalesce(func.sum(GoodsReceipt.total_amount), Decimal("0")))
            .where(
                extract("year", GoodsReceipt.receipt_date) == year,
                extract("month", GoodsReceipt.receipt_date) == month_num,
            )
        )) or Decimal("0")

        p: Decimal = (await db.scalar(
            select(func.coalesce(func.sum(Payment.amount), Decimal("0")))
            .where(
                extract("year", Payment.payment_date) == year,
                extract("month", Payment.payment_date) == month_num,
            )
        )) or Decimal("0")

        ret: Decimal = (await db.scalar(
            select(func.coalesce(func.sum(SupplierReturn.total_amount), Decimal("0")))
            .where(
                extract("year", SupplierReturn.return_date) == year,
                extract("month", SupplierReturn.return_date) == month_num,
            )
        )) or Decimal("0")

        monthly.append(MonthlyPoint(
            month=MONTH_AR[month_num - 1],
            receipts=float(r),
            payments=float(p),
            returns=float(ret),
        ))

    return DashboardStats(
        today_receipts=float(today_receipts),
        today_payments=float(today_payments),
        total_suppliers=total_suppliers,
        total_returns=float(total_returns),
        monthly=monthly,
    )
