import math
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.auth import CurrentUser, check_admin_permission, check_not_reports
from src.database.db import get_db
from src.database.models import DailyCashRegister, Payment
from src.models.cash_register import (
    CashRegisterResponse,
    CashRegisterUpsert,
    PaginatedCashRegisterResponse,
)

router = APIRouter(prefix="/cash-register", tags=["cash-register"])


async def _get_paid_to_suppliers(db: AsyncSession, register_date: date) -> Decimal:
    """مجموع ما دُفع للموردين في يوم معين من سجلات السدادات."""
    result = await db.scalar(
        select(func.coalesce(func.sum(Payment.amount), Decimal("0")))
        .where(Payment.payment_date == register_date)
    )
    return result or Decimal("0")


def _build_response(reg: DailyCashRegister, paid: Decimal) -> CashRegisterResponse:
    total_in = reg.opening_balance + reg.pos_total + reg.bank_withdrawal
    total_out = paid + reg.misc_expenses
    closing = total_in - total_out
    net_sales = reg.pos_total - paid
    return CashRegisterResponse(
        id=reg.id,
        register_date=reg.register_date,
        opening_balance=reg.opening_balance,
        pos_total=reg.pos_total,
        bank_withdrawal=reg.bank_withdrawal,
        misc_expenses=reg.misc_expenses,
        paid_to_suppliers=paid,
        total_in=total_in,
        total_out=total_out,
        closing_balance=closing,
        net_sales=net_sales,
        notes=reg.notes,
        created_at=reg.created_at,
        updated_at=reg.updated_at,
    )


# ─── قائمة ────────────────────────────────────────────

@router.get("", response_model=PaginatedCashRegisterResponse)
async def list_registers(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    year: int | None = Query(None),
    month: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    q = select(DailyCashRegister)
    count_q = select(func.count()).select_from(DailyCashRegister)

    if year:
        q = q.where(extract("year", DailyCashRegister.register_date) == year)
        count_q = count_q.where(extract("year", DailyCashRegister.register_date) == year)
    if month:
        q = q.where(extract("month", DailyCashRegister.register_date) == month)
        count_q = count_q.where(extract("month", DailyCashRegister.register_date) == month)

    total: int = (await db.scalar(count_q)) or 0
    q = q.order_by(DailyCashRegister.register_date.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    registers = result.scalars().all()

    items = []
    for reg in registers:
        paid = await _get_paid_to_suppliers(db, reg.register_date)
        items.append(_build_response(reg, paid))

    return PaginatedCashRegisterResponse(
        items=items,
        total=total,
        page=page,
        pages=math.ceil(total / page_size) if total else 1,
        page_size=page_size,
    )


# ─── يوم واحد بالتاريخ ────────────────────────────────

@router.get("/by-date/{date_str}", response_model=CashRegisterResponse)
async def get_by_date(
    date_str: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        d = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=422, detail="صيغة التاريخ غير صحيحة — يجب أن تكون YYYY-MM-DD")

    result = await db.execute(
        select(DailyCashRegister).where(DailyCashRegister.register_date == d)
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="لا توجد يومية لهذا التاريخ")

    paid = await _get_paid_to_suppliers(db, d)
    return _build_response(reg, paid)


# ─── إنشاء أو تعديل (upsert) ─────────────────────────

@router.put("", response_model=CashRegisterResponse, status_code=200)
async def upsert_register(
    body: CashRegisterUpsert,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_not_reports(user)

    result = await db.execute(
        select(DailyCashRegister).where(DailyCashRegister.register_date == body.register_date)
    )
    reg = result.scalar_one_or_none()

    if reg:
        reg.opening_balance = body.opening_balance
        reg.pos_total = body.pos_total
        reg.bank_withdrawal = body.bank_withdrawal
        reg.misc_expenses = body.misc_expenses
        reg.notes = body.notes
    else:
        reg = DailyCashRegister(
            register_date=body.register_date,
            opening_balance=body.opening_balance,
            pos_total=body.pos_total,
            bank_withdrawal=body.bank_withdrawal,
            misc_expenses=body.misc_expenses,
            notes=body.notes,
            created_by=user.id,
        )
        db.add(reg)

    await db.commit()
    await db.refresh(reg)

    paid = await _get_paid_to_suppliers(db, reg.register_date)
    return _build_response(reg, paid)


# ─── حذف ──────────────────────────────────────────────

@router.delete("/{register_id}", status_code=204)
async def delete_register(
    register_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_admin_permission(user)

    result = await db.execute(
        select(DailyCashRegister).where(DailyCashRegister.id == register_id)
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="اليومية غير موجودة")

    await db.delete(reg)
    await db.commit()
