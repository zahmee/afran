from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.auth.auth import CurrentUser, check_admin_permission, check_not_reports
from src.database.db import get_db
from src.database.models import Supplier, SupplierType
from src.models.supplier import (
    SupplierCreate,
    SupplierResponse,
    SupplierTypeCreate,
    SupplierTypeResponse,
    SupplierUpdate,
)

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


# ─── أنواع الموردين ───────────────────────────────────

@router.get("/types", response_model=list[SupplierTypeResponse])
async def list_types(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupplierType).order_by(SupplierType.id))
    return result.scalars().all()


@router.post("/types", response_model=SupplierTypeResponse, status_code=201)
async def create_type(
    body: SupplierTypeCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_admin_permission(user)

    dup = await db.execute(select(SupplierType).where(SupplierType.name == body.name))
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="نوع المورد موجود مسبقاً")

    st = SupplierType(name=body.name)
    db.add(st)
    await db.commit()
    await db.refresh(st)
    return st


@router.patch("/types/{type_id}", response_model=SupplierTypeResponse)
async def update_type(
    type_id: int,
    body: SupplierTypeCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_admin_permission(user)

    result = await db.execute(select(SupplierType).where(SupplierType.id == type_id))
    st = result.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="نوع المورد غير موجود")

    dup = await db.execute(
        select(SupplierType).where(SupplierType.name == body.name, SupplierType.id != type_id)
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="اسم النوع مسجل مسبقاً")

    st.name = body.name
    await db.commit()
    await db.refresh(st)
    return st


@router.delete("/types/{type_id}", status_code=204)
async def delete_type(
    type_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_admin_permission(user)

    result = await db.execute(select(SupplierType).where(SupplierType.id == type_id))
    st = result.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="نوع المورد غير موجود")

    # Check if any suppliers use this type
    suppliers = await db.execute(select(Supplier).where(Supplier.type_id == type_id))
    if suppliers.scalars().first():
        raise HTTPException(status_code=400, detail="لا يمكن الحذف — يوجد موردين مرتبطين بهذا النوع")

    await db.delete(st)
    await db.commit()


# ─── الموردين ─────────────────────────────────────────

def _supplier_to_response(s: Supplier) -> SupplierResponse:
    return SupplierResponse(
        id=s.id,
        name=s.name,
        type_id=s.type_id,
        type_name=s.type_rel.name if s.type_rel else None,
        sales_rate=s.sales_rate,
        opening_balance=s.opening_balance,
        deal_terms=s.deal_terms,
        is_active=s.is_active,
        created_at=s.created_at,
    )


@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Supplier)
        .options(selectinload(Supplier.type_rel))
        .order_by(Supplier.created_at.desc())
    )
    return [_supplier_to_response(s) for s in result.scalars().all()]


@router.post("", response_model=SupplierResponse, status_code=201)
async def create_supplier(
    body: SupplierCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_not_reports(user)

    # Verify type exists
    t = await db.execute(select(SupplierType).where(SupplierType.id == body.type_id))
    if not t.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="نوع المورد غير موجود")

    supplier = Supplier(
        name=body.name,
        type_id=body.type_id,
        sales_rate=body.sales_rate,
        opening_balance=body.opening_balance,
        deal_terms=body.deal_terms,
    )
    if body.created_at is not None:
        supplier.created_at = datetime.combine(body.created_at, datetime.min.time(), tzinfo=timezone.utc)
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier, ["type_rel"])
    return _supplier_to_response(supplier)


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Supplier)
        .options(selectinload(Supplier.type_rel))
        .where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="المورد غير موجود")
    return _supplier_to_response(supplier)


@router.patch("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: int,
    body: SupplierUpdate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Supplier)
        .options(selectinload(Supplier.type_rel))
        .where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="المورد غير موجود")

    check_not_reports(user)

    if body.name is not None:
        supplier.name = body.name
    if body.type_id is not None:
        t = await db.execute(select(SupplierType).where(SupplierType.id == body.type_id))
        if not t.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="نوع المورد غير موجود")
        supplier.type_id = body.type_id
    if body.sales_rate is not None:
        supplier.sales_rate = body.sales_rate
    if body.opening_balance is not None:
        supplier.opening_balance = body.opening_balance
    if body.deal_terms is not None:
        supplier.deal_terms = body.deal_terms
    if body.is_active is not None:
        supplier.is_active = body.is_active
    if body.created_at is not None:
        supplier.created_at = datetime.combine(body.created_at, datetime.min.time(), tzinfo=timezone.utc)

    await db.commit()
    await db.refresh(supplier, ["type_rel"])
    return _supplier_to_response(supplier)


@router.delete("/{supplier_id}", status_code=204)
async def delete_supplier(
    supplier_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_admin_permission(user)

    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="المورد غير موجود")

    await db.delete(supplier)
    await db.commit()
