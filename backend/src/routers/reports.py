from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.auth import CurrentUser, check_admin_permission
from src.database.db import get_db
from src.database.models import (
    DailyCashRegister,
    GoodsReceipt,
    GoodsReceiptItem,
    Payment,
    Supplier,
    SupplierReturn,
    SupplierType,
)

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


# ═════════════════════════════════════════════════════
# ═══  تقارير مفتوحة لجميع المستخدمين المسجّلين  ════
# ═════════════════════════════════════════════════════


# ─── 1) تقرير يومي إجمالي ─────────────────────────────

class DailySummaryRow(BaseModel):
    day: date
    total_goods_received: Decimal
    total_returns: Decimal
    total_payments: Decimal
    net_received: Decimal


class DailySummaryResponse(BaseModel):
    rows: list[DailySummaryRow]
    total_goods_received: Decimal
    total_returns: Decimal
    total_payments: Decimal
    total_net: Decimal


@router.get("/daily-summary", response_model=DailySummaryResponse)
async def daily_summary_report(
    user: CurrentUser,
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="end_date must be >= start_date")

    goods_rows = (await db.execute(
        select(
            GoodsReceipt.receipt_date.label("day"),
            func.coalesce(func.sum(GoodsReceipt.total_amount), Decimal("0")),
        )
        .where(and_(GoodsReceipt.receipt_date >= start_date, GoodsReceipt.receipt_date <= end_date))
        .group_by(GoodsReceipt.receipt_date)
    )).all()
    goods_map: dict[date, Decimal] = {r[0]: r[1] for r in goods_rows}

    returns_rows = (await db.execute(
        select(
            SupplierReturn.return_date.label("day"),
            func.coalesce(func.sum(SupplierReturn.total_amount), Decimal("0")),
        )
        .where(and_(SupplierReturn.return_date >= start_date, SupplierReturn.return_date <= end_date))
        .group_by(SupplierReturn.return_date)
    )).all()
    returns_map: dict[date, Decimal] = {r[0]: r[1] for r in returns_rows}

    payments_rows = (await db.execute(
        select(
            Payment.payment_date.label("day"),
            func.coalesce(func.sum(Payment.amount), Decimal("0")),
        )
        .where(and_(Payment.payment_date >= start_date, Payment.payment_date <= end_date))
        .group_by(Payment.payment_date)
    )).all()
    payments_map: dict[date, Decimal] = {r[0]: r[1] for r in payments_rows}

    all_days = sorted(set(goods_map.keys()) | set(returns_map.keys()) | set(payments_map.keys()))

    rows: list[DailySummaryRow] = []
    total_goods = Decimal("0")
    total_returns = Decimal("0")
    total_payments = Decimal("0")
    total_net = Decimal("0")

    for day in all_days:
        goods = goods_map.get(day, Decimal("0"))
        returns_v = returns_map.get(day, Decimal("0"))
        payments = payments_map.get(day, Decimal("0"))
        net = goods - returns_v
        total_goods += goods
        total_returns += returns_v
        total_payments += payments
        total_net += net
        rows.append(DailySummaryRow(
            day=day,
            total_goods_received=goods,
            total_returns=returns_v,
            total_payments=payments,
            net_received=net,
        ))

    return DailySummaryResponse(
        rows=rows,
        total_goods_received=total_goods,
        total_returns=total_returns,
        total_payments=total_payments,
        total_net=total_net,
    )


# ─── 2) كشف حساب مورد ────────────────────────────────

class StatementEntry(BaseModel):
    entry_date: date
    entry_type: str  # "receipt" | "return" | "payment"
    description: str
    debit: Decimal   # ما على المورد (بضاعة مستلمة)
    credit: Decimal  # ما للمورد (مرتجعات + سدادات)
    running_balance: Decimal


class SupplierStatementResponse(BaseModel):
    supplier_id: int
    supplier_name: str
    opening_balance: Decimal
    sales_rate: Decimal
    entries: list[StatementEntry]
    total_receipts: Decimal
    total_returns: Decimal
    total_payments: Decimal
    closing_balance: Decimal


@router.get("/supplier-statement", response_model=SupplierStatementResponse)
async def supplier_statement_report(
    user: CurrentUser,
    supplier_id: int = Query(...),
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="end_date must be >= start_date")

    supplier = (await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )).scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    receipts = (await db.execute(
        select(GoodsReceipt)
        .where(and_(
            GoodsReceipt.supplier_id == supplier_id,
            GoodsReceipt.receipt_date >= start_date,
            GoodsReceipt.receipt_date <= end_date,
        ))
    )).scalars().all()

    returns_ = (await db.execute(
        select(SupplierReturn)
        .where(and_(
            SupplierReturn.supplier_id == supplier_id,
            SupplierReturn.return_date >= start_date,
            SupplierReturn.return_date <= end_date,
        ))
    )).scalars().all()

    payments = (await db.execute(
        select(Payment)
        .where(and_(
            Payment.supplier_id == supplier_id,
            Payment.payment_date >= start_date,
            Payment.payment_date <= end_date,
        ))
    )).scalars().all()

    raw_entries: list[tuple[date, str, str, Decimal, Decimal]] = []
    for r in receipts:
        raw_entries.append((r.receipt_date, "receipt", "بضاعة مستلمة", r.total_amount, Decimal("0")))
    for rt in returns_:
        raw_entries.append((rt.return_date, "return", "مرتجعات", Decimal("0"), rt.total_amount))
    for p in payments:
        raw_entries.append((p.payment_date, "payment", "سداد", Decimal("0"), p.amount))

    raw_entries.sort(key=lambda e: (e[0], e[1]))

    rate = supplier.sales_rate / Decimal("100")
    running = supplier.opening_balance
    entries: list[StatementEntry] = []
    total_receipts = Decimal("0")
    total_returns = Decimal("0")
    total_payments = Decimal("0")

    for entry_date, entry_type, desc, debit, credit in raw_entries:
        if entry_type == "receipt":
            running += debit * rate
            total_receipts += debit
        elif entry_type == "return":
            running -= credit * rate
            total_returns += credit
        else:
            running -= credit
            total_payments += credit
        entries.append(StatementEntry(
            entry_date=entry_date,
            entry_type=entry_type,
            description=desc,
            debit=debit,
            credit=credit,
            running_balance=running,
        ))

    return SupplierStatementResponse(
        supplier_id=supplier.id,
        supplier_name=supplier.name,
        opening_balance=supplier.opening_balance,
        sales_rate=supplier.sales_rate,
        entries=entries,
        total_receipts=total_receipts,
        total_returns=total_returns,
        total_payments=total_payments,
        closing_balance=running,
    )


# ─── 3) أرصدة الموردين (متاح للجميع) ──────────────────

@router.get("/supplier-balances-open", response_model=ReportSummaryResponse)
async def suppliers_balance_open(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Supplier, SupplierType.name.label("type_name"))
        .outerjoin(SupplierType, Supplier.type_id == SupplierType.id)
        .where(Supplier.is_active == True)  # noqa: E712
        .order_by(Supplier.name)
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

    goods_result = await db.execute(
        select(GoodsReceipt.supplier_id, func.coalesce(func.sum(GoodsReceipt.total_amount), Decimal("0")))
        .where(GoodsReceipt.supplier_id.in_(supplier_ids))
        .group_by(GoodsReceipt.supplier_id)
    )
    goods_map: dict[int, Decimal] = {row[0]: row[1] for row in goods_result.all()}

    returns_result = await db.execute(
        select(SupplierReturn.supplier_id, func.coalesce(func.sum(SupplierReturn.total_amount), Decimal("0")))
        .where(SupplierReturn.supplier_id.in_(supplier_ids))
        .group_by(SupplierReturn.supplier_id)
    )
    returns_map: dict[int, Decimal] = {row[0]: row[1] for row in returns_result.all()}

    payments_result = await db.execute(
        select(Payment.supplier_id, func.coalesce(func.sum(Payment.amount), Decimal("0")))
        .where(Payment.supplier_id.in_(supplier_ids))
        .group_by(Payment.supplier_id)
    )
    payments_map: dict[int, Decimal] = {row[0]: row[1] for row in payments_result.all()}

    suppliers_list: list[SupplierBalanceSummary] = []
    total_goods_all = Decimal("0")
    total_returns_all = Decimal("0")
    total_paid_all = Decimal("0")
    total_remaining_all = Decimal("0")

    for supplier, type_name in rows:
        goods = goods_map.get(supplier.id, Decimal("0"))
        returns = returns_map.get(supplier.id, Decimal("0"))
        paid = payments_map.get(supplier.id, Decimal("0"))
        net = goods - returns
        commission = net * (supplier.sales_rate / Decimal("100"))
        remaining = supplier.opening_balance + commission - paid

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
        active_suppliers=len(rows),
        total_goods_received=total_goods_all,
        total_returns=total_returns_all,
        total_paid=total_paid_all,
        total_remaining_balance=total_remaining_all,
        suppliers=suppliers_list,
    )


# ─── 4) تقرير السدادات ────────────────────────────────

class PaymentsSummaryRow(BaseModel):
    supplier_id: int
    supplier_name: str
    type_name: str | None
    payments_count: int
    total_paid: Decimal


class PaymentsSummaryResponse(BaseModel):
    start_date: date
    end_date: date
    rows: list[PaymentsSummaryRow]
    total_paid: Decimal
    total_count: int


@router.get("/payments-summary", response_model=PaymentsSummaryResponse)
async def payments_summary_report(
    user: CurrentUser,
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="end_date must be >= start_date")

    result = await db.execute(
        select(
            Supplier.id,
            Supplier.name,
            SupplierType.name.label("type_name"),
            func.count(Payment.id),
            func.coalesce(func.sum(Payment.amount), Decimal("0")),
        )
        .join(Payment, Payment.supplier_id == Supplier.id)
        .outerjoin(SupplierType, Supplier.type_id == SupplierType.id)
        .where(and_(Payment.payment_date >= start_date, Payment.payment_date <= end_date))
        .group_by(Supplier.id, Supplier.name, SupplierType.name)
        .order_by(func.coalesce(func.sum(Payment.amount), Decimal("0")).desc())
    )
    raw_rows = result.all()

    rows = [
        PaymentsSummaryRow(
            supplier_id=r[0],
            supplier_name=r[1],
            type_name=r[2],
            payments_count=r[3],
            total_paid=r[4],
        )
        for r in raw_rows
    ]
    total_paid = sum((r.total_paid for r in rows), Decimal("0"))
    total_count = sum(r.payments_count for r in rows)

    return PaymentsSummaryResponse(
        start_date=start_date,
        end_date=end_date,
        rows=rows,
        total_paid=total_paid,
        total_count=total_count,
    )


# ─── 5) تقرير الصندوق الشهري ─────────────────────────

class CashMonthlyRow(BaseModel):
    register_date: date
    opening_balance: Decimal
    pos_total: Decimal
    bank_withdrawal: Decimal
    misc_expenses: Decimal
    closing_balance: Decimal


class CashMonthlyResponse(BaseModel):
    year: int
    month: int
    rows: list[CashMonthlyRow]
    total_opening: Decimal
    total_pos: Decimal
    total_withdrawal: Decimal
    total_expenses: Decimal
    total_closing: Decimal


@router.get("/cash-monthly", response_model=CashMonthlyResponse)
async def cash_monthly_report(
    user: CurrentUser,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DailyCashRegister)
        .where(and_(
            func.strftime("%Y", DailyCashRegister.register_date) == str(year),
            func.strftime("%m", DailyCashRegister.register_date) == f"{month:02d}",
        ))
        .order_by(DailyCashRegister.register_date)
    )
    records = result.scalars().all()

    rows: list[CashMonthlyRow] = []
    total_opening = Decimal("0")
    total_pos = Decimal("0")
    total_withdrawal = Decimal("0")
    total_expenses = Decimal("0")
    total_closing = Decimal("0")

    for r in records:
        closing = r.opening_balance + r.pos_total + r.bank_withdrawal - r.misc_expenses
        total_opening += r.opening_balance
        total_pos += r.pos_total
        total_withdrawal += r.bank_withdrawal
        total_expenses += r.misc_expenses
        total_closing += closing
        rows.append(CashMonthlyRow(
            register_date=r.register_date,
            opening_balance=r.opening_balance,
            pos_total=r.pos_total,
            bank_withdrawal=r.bank_withdrawal,
            misc_expenses=r.misc_expenses,
            closing_balance=closing,
        ))

    return CashMonthlyResponse(
        year=year,
        month=month,
        rows=rows,
        total_opening=total_opening,
        total_pos=total_pos,
        total_withdrawal=total_withdrawal,
        total_expenses=total_expenses,
        total_closing=total_closing,
    )
