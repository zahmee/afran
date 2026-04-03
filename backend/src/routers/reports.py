from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.auth import CurrentUser, check_admin_permission
from src.database.db import get_db
from src.database.models import GoodsReceipt, GoodsReceiptItem, Payment, Supplier, SupplierReturn, SupplierType

router = APIRouter(prefix="/reports", tags=["reports"])


# ─── Schemas ──────────────────────────────────────────

class SupplierBalanceSummary(BaseModel):
    id: int
    name: str
    type_name: str | None
    sales_rate: Decimal
    opening_balance: Decimal
    total_goods_received: Decimal
    total_returns: Decimal
    net_goods: Decimal
    commission_amount: Decimal
    total_paid: Decimal
    remaining_balance: Decimal
    is_active: bool


class ReportSummaryResponse(BaseModel):
    total_suppliers: int
    active_suppliers: int
    total_goods_received: Decimal
    total_returns: Decimal
    total_paid: Decimal
    total_remaining_balance: Decimal
    suppliers: list[SupplierBalanceSummary]


# ─── أرصدة الموردين ───────────────────────────────────

@router.get("/suppliers-balance", response_model=ReportSummaryResponse)
async def suppliers_balance_report(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    check_admin_permission(user)

    # جلب كل الموردين مع أنواعهم
    result = await db.execute(
        select(Supplier, SupplierType.name.label("type_name"))
        .outerjoin(SupplierType, Supplier.type_id == SupplierType.id)
        .order_by(Supplier.is_active.desc(), Supplier.name)
    )
    rows = result.all()

    if not rows:
        return ReportSummaryResponse(
            total_suppliers=0,
            active_suppliers=0,
            total_goods_received=Decimal("0"),
            total_returns=Decimal("0"),
            total_paid=Decimal("0"),
            total_remaining_balance=Decimal("0"),
            suppliers=[],
        )

    supplier_ids = [row[0].id for row in rows]

    # إجمالي البضاعة المستلمة لكل مورد
    goods_result = await db.execute(
        select(GoodsReceipt.supplier_id, func.coalesce(func.sum(GoodsReceipt.total_amount), Decimal("0")))
        .where(GoodsReceipt.supplier_id.in_(supplier_ids))
        .group_by(GoodsReceipt.supplier_id)
    )
    goods_map: dict[int, Decimal] = {row[0]: row[1] for row in goods_result.all()}

    # إجمالي المرتجعات لكل مورد
    returns_result = await db.execute(
        select(SupplierReturn.supplier_id, func.coalesce(func.sum(SupplierReturn.total_amount), Decimal("0")))
        .where(SupplierReturn.supplier_id.in_(supplier_ids))
        .group_by(SupplierReturn.supplier_id)
    )
    returns_map: dict[int, Decimal] = {row[0]: row[1] for row in returns_result.all()}

    # إجمالي السدادات لكل مورد
    payments_result = await db.execute(
        select(Payment.supplier_id, func.coalesce(func.sum(Payment.amount), Decimal("0")))
        .where(Payment.supplier_id.in_(supplier_ids))
        .group_by(Payment.supplier_id)
    )
    payments_map: dict[int, Decimal] = {row[0]: row[1] for row in payments_result.all()}

    # بناء القائمة
    suppliers_list: list[SupplierBalanceSummary] = []
    total_goods_all = Decimal("0")
    total_returns_all = Decimal("0")
    total_paid_all = Decimal("0")
    total_remaining_all = Decimal("0")
    active_count = 0

    for supplier, type_name in rows:
        goods = goods_map.get(supplier.id, Decimal("0"))
        returns = returns_map.get(supplier.id, Decimal("0"))
        paid = payments_map.get(supplier.id, Decimal("0"))
        net = goods - returns
        commission = net * (supplier.sales_rate / Decimal("100"))
        remaining = supplier.opening_balance + commission - paid

        if supplier.is_active:
            active_count += 1

        total_goods_all += goods
        total_returns_all += returns
        total_paid_all += paid
        total_remaining_all += remaining

        suppliers_list.append(SupplierBalanceSummary(
            id=supplier.id,
            name=supplier.name,
            type_name=type_name,
            sales_rate=supplier.sales_rate,
            opening_balance=supplier.opening_balance,
            total_goods_received=goods,
            total_returns=returns,
            net_goods=net,
            commission_amount=commission,
            total_paid=paid,
            remaining_balance=remaining,
            is_active=supplier.is_active,
        ))

    return ReportSummaryResponse(
        total_suppliers=len(rows),
        active_suppliers=active_count,
        total_goods_received=total_goods_all,
        total_returns=total_returns_all,
        total_paid=total_paid_all,
        total_remaining_balance=total_remaining_all,
        suppliers=suppliers_list,
    )
