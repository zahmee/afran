import math
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.auth.auth import CurrentUser
from src.database.db import get_db
from src.database.models import GoodsReceipt, GoodsReceiptItem, Supplier
from src.models.goods_receipt import (
    GoodsReceiptCreate,
    GoodsReceiptResponse,
    GoodsReceiptUpdate,
    PaginatedGoodsReceiptResponse,
)

router = APIRouter(prefix="/goods-receipts", tags=["goods-receipts"])


def _to_response(r: GoodsReceipt) -> GoodsReceiptResponse:
    return GoodsReceiptResponse(
        id=r.id,
        supplier_id=r.supplier_id,
        supplier_name=r.supplier.name if r.supplier else "",
        receipt_date=r.receipt_date,
        receipt_time=r.receipt_time,
        total_amount=r.total_amount,
        items_count=len(r.items),
        created_at=r.created_at,
        items=r.items,
    )


def _build_filters(q, supplier_name, year, month, day, joined_supplier=False):
    """يُضيف شروط الفلترة إلى الاستعلام."""
    if supplier_name:
        if not joined_supplier:
            q = q.join(GoodsReceipt.supplier)
        q = q.where(Supplier.name.ilike(f"%{supplier_name}%"))
    if year:
        q = q.where(extract("year", GoodsReceipt.receipt_date) == year)
    if month:
        q = q.where(extract("month", GoodsReceipt.receipt_date) == month)
    if day:
        q = q.where(extract("day", GoodsReceipt.receipt_date) == day)
    return q


# ─── قائمة مع بحث وفلترة وتصفح ───────────────────────

@router.get("", response_model=PaginatedGoodsReceiptResponse)
async def list_receipts(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    supplier_name: str | None = Query(None),
    year: int | None = Query(None),
    month: int | None = Query(None),
    day: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    needs_join = bool(supplier_name)

    # استعلام العدد
    count_q = select(func.count()).select_from(GoodsReceipt)
    count_q = _build_filters(count_q, supplier_name, year, month, day, joined_supplier=needs_join)
    total: int = (await db.scalar(count_q)) or 0

    # استعلام البيانات
    data_q = (
        select(GoodsReceipt)
        .options(selectinload(GoodsReceipt.supplier), selectinload(GoodsReceipt.items))
    )
    data_q = _build_filters(data_q, supplier_name, year, month, day, joined_supplier=needs_join)
    data_q = (
        data_q
        .order_by(GoodsReceipt.receipt_date.desc(), GoodsReceipt.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(data_q)
    rows = result.scalars().all()

    return PaginatedGoodsReceiptResponse(
        items=[_to_response(r) for r in rows],
        total=total,
        page=page,
        pages=math.ceil(total / page_size) if total else 1,
        page_size=page_size,
    )


# ─── استلام واحد ──────────────────────────────────────

@router.get("/{receipt_id}", response_model=GoodsReceiptResponse)
async def get_receipt(
    receipt_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GoodsReceipt)
        .options(selectinload(GoodsReceipt.supplier), selectinload(GoodsReceipt.items))
        .where(GoodsReceipt.id == receipt_id)
    )
    receipt = result.scalar_one_or_none()
    if not receipt:
        raise HTTPException(status_code=404, detail="سجل الاستلام غير موجود")
    return _to_response(receipt)


# ─── إنشاء جديد ────────────────────────────────────────

@router.post("", response_model=GoodsReceiptResponse, status_code=201)
async def create_receipt(
    body: GoodsReceiptCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    supplier = await db.execute(select(Supplier).where(Supplier.id == body.supplier_id))
    if not supplier.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="المورد غير موجود")

    total_amount = sum(item.quantity * item.unit_price for item in body.items)

    receipt = GoodsReceipt(
        supplier_id=body.supplier_id,
        receipt_date=body.receipt_date,
        receipt_time=body.receipt_time,
        total_amount=Decimal(str(total_amount)),
        created_by=user.id,
    )
    db.add(receipt)
    await db.flush()

    for item in body.items:
        db.add(GoodsReceiptItem(
            receipt_id=receipt.id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.quantity * item.unit_price,
        ))

    await db.commit()
    await db.refresh(receipt, ["supplier", "items"])
    return _to_response(receipt)


# ─── تعديل ────────────────────────────────────────────

@router.patch("/{receipt_id}", response_model=GoodsReceiptResponse)
async def update_receipt(
    receipt_id: int,
    body: GoodsReceiptUpdate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GoodsReceipt)
        .options(selectinload(GoodsReceipt.supplier), selectinload(GoodsReceipt.items))
        .where(GoodsReceipt.id == receipt_id)
    )
    receipt = result.scalar_one_or_none()
    if not receipt:
        raise HTTPException(status_code=404, detail="سجل الاستلام غير موجود")

    if body.supplier_id is not None:
        supplier = await db.execute(select(Supplier).where(Supplier.id == body.supplier_id))
        if not supplier.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="المورد غير موجود")
        receipt.supplier_id = body.supplier_id

    if body.receipt_date is not None:
        receipt.receipt_date = body.receipt_date

    if body.receipt_time is not None:
        receipt.receipt_time = body.receipt_time

    if body.items is not None:
        # حذف البنود القديمة وإضافة الجديدة
        for old_item in receipt.items:
            await db.delete(old_item)
        await db.flush()

        new_total = Decimal("0")
        for item in body.items:
            t = item.quantity * item.unit_price
            db.add(GoodsReceiptItem(
                receipt_id=receipt.id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total=t,
            ))
            new_total += t
        receipt.total_amount = new_total

    await db.commit()
    await db.refresh(receipt, ["supplier", "items"])
    return _to_response(receipt)


# ─── حذف ──────────────────────────────────────────────

@router.delete("/{receipt_id}", status_code=204)
async def delete_receipt(
    receipt_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GoodsReceipt).where(GoodsReceipt.id == receipt_id)
    )
    receipt = result.scalar_one_or_none()
    if not receipt:
        raise HTTPException(status_code=404, detail="سجل الاستلام غير موجود")

    await db.delete(receipt)
    await db.commit()
