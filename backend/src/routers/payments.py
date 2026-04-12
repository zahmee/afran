import math
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.auth.auth import CurrentUser, check_delete_permission, check_write_permission
from src.database.db import get_db
from src.database.models import GoodsReceipt, GoodsReceiptItem, Payment, Supplier, SupplierReturn
from src.models.payment import (
    PaginatedPaymentResponse,
    PaymentCreate,
    PaymentResponse,
    PaymentUpdate,
    SupplierBalanceResponse,
)

router = APIRouter(prefix="/payments", tags=["payments"])


def _to_response(p: Payment) -> PaymentResponse:
    return PaymentResponse(
        id=p.id,
        supplier_id=p.supplier_id,
        supplier_name=p.supplier.name if p.supplier else "",
        payment_date=p.payment_date,
        payment_time=p.payment_time,
        amount=p.amount,
        notes=p.notes,
        created_at=p.created_at,
    )


def _apply_filters(q, supplier_name, year, month, day):
    if supplier_name:
        q = q.join(Supplier, Payment.supplier_id == Supplier.id).where(Supplier.name.ilike(f"%{supplier_name}%"))
    if year:
        q = q.where(extract("year", Payment.payment_date) == year)
    if month:
        q = q.where(extract("month", Payment.payment_date) == month)
    if day:
        q = q.where(extract("day", Payment.payment_date) == day)
    return q


# ─── قائمة ────────────────────────────────────────────

@router.get("", response_model=PaginatedPaymentResponse)
async def list_payments(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    supplier_name: str | None = Query(None),
    year: int | None = Query(None),
    month: int | None = Query(None),
    day: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    count_q = _apply_filters(
        select(func.count()).select_from(Payment),
        supplier_name, year, month, day,
    )
    total: int = (await db.scalar(count_q)) or 0

    # حساب إجمالي المبلغ للفلاتر الحالية
    total_amount_q = _apply_filters(
        select(func.coalesce(func.sum(Payment.amount), Decimal("0"))),
        supplier_name, year, month, day,
    )
    total_amount: Decimal = (await db.scalar(total_amount_q)) or Decimal("0")

    data_q = _apply_filters(
        select(Payment).options(selectinload(Payment.supplier)),
        supplier_name, year, month, day,
    )
    data_q = (
        data_q
        .order_by(Payment.payment_date.desc(), Payment.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(data_q)

    return PaginatedPaymentResponse(
        items=[_to_response(p) for p in result.scalars().all()],
        total=total,
        total_amount=total_amount,
        page=page,
        pages=math.ceil(total / page_size) if total else 1,
        page_size=page_size,
    )


# ─── احتساب المبلغ المقترح ─────────────────────────────
# يجب أن يكون قبل /{payment_id} لتجنب تعارض المسارات

@router.get("/calculate/{supplier_id}", response_model=SupplierBalanceResponse)
async def calculate_balance(
    supplier_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="المورد غير موجود")

    total_goods: Decimal = (await db.scalar(
        select(func.coalesce(func.sum(GoodsReceipt.total_amount), Decimal("0")))
        .where(GoodsReceipt.supplier_id == supplier_id)
    )) or Decimal("0")

    total_returns: Decimal = (await db.scalar(
        select(func.coalesce(func.sum(SupplierReturn.total_amount), Decimal("0")))
        .where(SupplierReturn.supplier_id == supplier_id)
    )) or Decimal("0")

    total_paid: Decimal = (await db.scalar(
        select(func.coalesce(func.sum(Payment.amount), Decimal("0")))
        .where(Payment.supplier_id == supplier_id)
    )) or Decimal("0")

    remaining_deduction: Decimal = (await db.scalar(
        select(func.coalesce(
            func.sum(GoodsReceiptItem.remaining * GoodsReceiptItem.unit_price),
            Decimal("0"),
        ))
        .join(GoodsReceipt, GoodsReceiptItem.receipt_id == GoodsReceipt.id)
        .where(GoodsReceipt.supplier_id == supplier_id)
        .where(GoodsReceiptItem.remaining > 0)
    )) or Decimal("0")

    net_goods = total_goods - total_returns
    opening_balance = supplier.opening_balance
    sales_rate = supplier.sales_rate

    net_after_remaining = net_goods - remaining_deduction
    suggested = (
        opening_balance
        + net_after_remaining * (1 - sales_rate / Decimal("100"))
        - total_paid
    )

    return SupplierBalanceResponse(
        supplier_id=supplier.id,
        supplier_name=supplier.name,
        opening_balance=opening_balance,
        total_goods_received=total_goods,
        total_supplier_returns=total_returns,
        net_goods_received=net_goods,
        sales_rate=sales_rate,
        total_already_paid=total_paid,
        remaining_deduction=remaining_deduction,
        net_after_remaining=net_after_remaining,
        suggested_amount=suggested,
    )


# ─── سجل واحد ─────────────────────────────────────────

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.supplier))
        .where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="سجل السداد غير موجود")
    return _to_response(payment)


# ─── إنشاء ────────────────────────────────────────────

@router.post("", response_model=PaymentResponse, status_code=201)
async def create_payment(
    body: PaymentCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_write_permission(user, body.payment_date)

    result = await db.execute(select(Supplier).where(Supplier.id == body.supplier_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="المورد غير موجود")

    payment = Payment(
        supplier_id=body.supplier_id,
        payment_date=body.payment_date,
        payment_time=body.payment_time,
        amount=body.amount,
        notes=body.notes,
        created_by=user.id,
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment, ["supplier"])
    return _to_response(payment)


# ─── تعديل ────────────────────────────────────────────

@router.patch("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    body: PaymentUpdate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.supplier))
        .where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="سجل السداد غير موجود")

    check_write_permission(user, payment.payment_date)

    if body.supplier_id is not None:
        s = await db.execute(select(Supplier).where(Supplier.id == body.supplier_id))
        if not s.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="المورد غير موجود")
        payment.supplier_id = body.supplier_id
    if body.payment_date is not None:
        payment.payment_date = body.payment_date
    if body.payment_time is not None:
        payment.payment_time = body.payment_time
    if body.amount is not None:
        payment.amount = body.amount
    if body.notes is not None:
        payment.notes = body.notes

    await db.commit()
    await db.refresh(payment, ["supplier"])
    return _to_response(payment)


# ─── حذف ──────────────────────────────────────────────

@router.delete("/{payment_id}", status_code=204)
async def delete_payment(
    payment_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_delete_permission(user)

    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="سجل السداد غير موجود")
    await db.delete(payment)
    await db.commit()
