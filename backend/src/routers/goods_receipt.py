from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.auth.auth import CurrentUser
from src.database.db import get_db
from src.database.models import GoodsReceipt, GoodsReceiptItem, Supplier
from src.models.goods_receipt import GoodsReceiptCreate, GoodsReceiptResponse

router = APIRouter(prefix="/goods-receipts", tags=["goods-receipts"])


def _to_response(r: GoodsReceipt) -> GoodsReceiptResponse:
    return GoodsReceiptResponse(
        id=r.id,
        supplier_id=r.supplier_id,
        supplier_name=r.supplier.name if r.supplier else "",
        receipt_date=r.receipt_date,
        receipt_time=r.receipt_time,
        total_amount=r.total_amount,
        created_at=r.created_at,
        items=r.items,
    )


@router.get("", response_model=list[GoodsReceiptResponse])
async def list_receipts(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GoodsReceipt)
        .options(selectinload(GoodsReceipt.supplier), selectinload(GoodsReceipt.items))
        .order_by(GoodsReceipt.receipt_date.desc(), GoodsReceipt.id.desc())
    )
    return [_to_response(r) for r in result.scalars().all()]


@router.post("", response_model=GoodsReceiptResponse, status_code=201)
async def create_receipt(
    body: GoodsReceiptCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    # تحقق من وجود المورد
    supplier = await db.execute(select(Supplier).where(Supplier.id == body.supplier_id))
    if not supplier.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="المورد غير موجود")

    # احسب الإجمالي من البنود — لا تثق بالقيمة الواردة
    total_amount = sum(item.quantity * item.unit_price for item in body.items)

    receipt = GoodsReceipt(
        supplier_id=body.supplier_id,
        receipt_date=body.receipt_date,
        receipt_time=body.receipt_time,
        total_amount=Decimal(str(total_amount)),
        created_by=user.id,
    )
    db.add(receipt)
    await db.flush()  # للحصول على receipt.id قبل إضافة البنود

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
