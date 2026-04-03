from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, field_validator


# ─── إنشاء / تعديل ─────────────────────────────────────

class CashRegisterUpsert(BaseModel):
    register_date: date
    opening_balance: Decimal = Decimal("0")
    pos_total: Decimal = Decimal("0")
    bank_withdrawal: Decimal = Decimal("0")
    misc_expenses: Decimal = Decimal("0")
    notes: str | None = None

    @field_validator("pos_total", "bank_withdrawal", "misc_expenses", "opening_balance")
    @classmethod
    def non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("القيمة لا يمكن أن تكون سالبة")
        return v


# ─── استجابة ───────────────────────────────────────────

class CashRegisterResponse(BaseModel):
    id: int
    register_date: date
    opening_balance: Decimal
    pos_total: Decimal
    bank_withdrawal: Decimal
    misc_expenses: Decimal
    # محسوبة من السدادات
    paid_to_suppliers: Decimal
    # محسوبة
    total_in: Decimal         # opening + pos + bank
    total_out: Decimal        # paid_to_suppliers + misc_expenses
    closing_balance: Decimal  # total_in - total_out
    net_sales: Decimal        # pos_total - paid_to_suppliers
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedCashRegisterResponse(BaseModel):
    items: list[CashRegisterResponse]
    total: int
    page: int
    pages: int
    page_size: int
