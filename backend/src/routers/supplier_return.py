import math
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.auth.auth import CurrentUser, check_delete_permission, check_write_permission
from src.database.db import get_db
from src.database.models import Supplier, SupplierReturn, SupplierReturnItem
from src.models.supplier_return import (
    PaginatedSupplierReturnResponse,
    SupplierReturnCreate,
    SupplierReturnResponse,
    SupplierReturnUpdate,
)

router = APIRouter(prefix="/supplier-returns", tags=["supplier-returns"])


def _to_response(r: SupplierReturn) -> SupplierReturnResponse:
    return SupplierReturnResponse(
        id=r.id,
        supplier_id=r.supplier_id,
        supplier_name=r.supplier.name if r.supplier else "",
        return_date=r.return_date,
        return_time=r.return_time,
        total_amount=r.total_amount,
        items_count=len(r.items),
        created_at=r.created_at,
        items=r.items,
    )


def _apply_filters(q, supplier_name, year, month, day):
    if supplier_name:
        q = q.join(SupplierReturn.supplier).where(Supplier.name.ilike(f"%{supplier_name}%"))
    if year:
        q = q.where(extract("year", SupplierReturn.return_date) == year)
    if month:
        q = q.where(extract("month", SupplierReturn.return_date) == month)
    if day:
        q = q.where(extract("day", SupplierReturn.return_date) == day)
    return q


# ─── قائمة ────────────────────────────────────────────

@router.get("", response_model=PaginatedSupplierReturnResponse)
async def list_returns(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    supplier_name: str | None = Query(None),
    year: int | None = Query(None),
    month: int | None = Query(None),
    day: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    count_q = _apply_filters(select(func.count()).select_from(SupplierReturn), supplier_name, year, month, day)
    total: int = (await db.scalar(count_q)) or 0

    data_q = _apply_filters(
        select(SupplierReturn).options(
            selectinload(SupplierReturn.supplier), selectinload(SupplierReturn.items)
        ),
        supplier_name, year, month, day,
    )
    data_q = (
        data_q
        .order_by(SupplierReturn.return_date.desc(), SupplierReturn.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(data_q)

    return PaginatedSupplierReturnResponse(
        items=[_to_response(r) for r in result.scalars().all()],
        total=total,
        page=page,
        pages=math.ceil(total / page_size) if total else 1,
        page_size=page_size,
    )


# ─── واحد ──────────────────────────────────────────────

@router.get("/{return_id}", response_model=SupplierReturnResponse)
async def get_return(
    return_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SupplierReturn)
        .options(selectinload(SupplierReturn.supplier), selectinload(SupplierReturn.items))
        .where(SupplierReturn.id == return_id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="سجل المرتجع غير موجود")
    return _to_response(r)


# ─── إنشاء ────────────────────────────────────────────

@router.post("", response_model=SupplierReturnResponse, status_code=201)
async def create_return(
    body: SupplierReturnCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_write_permission(user, body.return_date)

    supplier = await db.execute(select(Supplier).where(Supplier.id == body.supplier_id))
    if not supplier.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="المورد غير موجود")

    total_amount = sum(item.quantity * item.unit_price for item in body.items)

    ret = SupplierReturn(
        supplier_id=body.supplier_id,
        return_date=body.return_date,
        return_time=body.return_time,
        total_amount=Decimal(str(total_amount)),
        created_by=user.id,
    )
    db.add(ret)
    await db.flush()

    for item in body.items:
        db.add(SupplierReturnItem(
            return_id=ret.id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.quantity * item.unit_price,
        ))

    await db.commit()
    await db.refresh(ret, ["supplier", "items"])
    return _to_response(ret)


# ─── تعديل ────────────────────────────────────────────

@router.patch("/{return_id}", response_model=SupplierReturnResponse)
async def update_return(
    return_id: int,
    body: SupplierReturnUpdate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SupplierReturn)
        .options(selectinload(SupplierReturn.supplier), selectinload(SupplierReturn.items))
        .where(SupplierReturn.id == return_id)
    )
    ret = result.scalar_one_or_none()
    if not ret:
        raise HTTPException(status_code=404, detail="سجل المرتجع غير موجود")

    check_write_permission(user, ret.return_date)

    if body.supplier_id is not None:
        supplier = await db.execute(select(Supplier).where(Supplier.id == body.supplier_id))
        if not supplier.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="المورد غير موجود")
        ret.supplier_id = body.supplier_id

    if body.return_date is not None:
        ret.return_date = body.return_date

    if body.return_time is not None:
        ret.return_time = body.return_time

    if body.items is not None:
        for old in ret.items:
            await db.delete(old)
        await db.flush()

        new_total = Decimal("0")
        for item in body.items:
            t = item.quantity * item.unit_price
            db.add(SupplierReturnItem(
                return_id=ret.id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total=t,
            ))
            new_total += t
        ret.total_amount = new_total

    await db.commit()
    await db.refresh(ret, ["supplier", "items"])
    return _to_response(ret)


# ─── حذف ──────────────────────────────────────────────

@router.delete("/{return_id}", status_code=204)
async def delete_return(
    return_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_delete_permission(user)

    result = await db.execute(select(SupplierReturn).where(SupplierReturn.id == return_id))
    ret = result.scalar_one_or_none()
    if not ret:
        raise HTTPException(status_code=404, detail="سجل المرتجع غير موجود")
    await db.delete(ret)
    await db.commit()
