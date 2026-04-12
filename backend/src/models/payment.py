from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, field_validator


# ─── إنشاء ─────────────────────────────────────────────

class PaymentCreate(BaseModel):
    supplier_id: int
    payment_date: date
    payment_time: str          # HH:MM
    amount: Decimal
    notes: str | None = None

    @field_validator("payment_time")
    @classmethod
    def time_format(cls, v: str) -> str:
        v = v.strip()
        parts = v.split(":")
        if len(parts) != 2 or not all(p.isdigit() for p in parts):
            raise ValueError("صيغة الوقت غير صحيحة — يجب أن تكون HH:MM")
        return v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("المبلغ يجب أن يكون أكبر من صفر")
        return v


# ─── تعديل ─────────────────────────────────────────────

class PaymentUpdate(BaseModel):
    supplier_id: int | None = None
    payment_date: date | None = None
    payment_time: str | None = None
    amount: Decimal | None = None
    notes: str | None = None

    @field_validator("payment_time")
    @classmethod
    def time_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        parts = v.split(":")
        if len(parts) != 2 or not all(p.isdigit() for p in parts):
            raise ValueError("صيغة الوقت غير صحيحة — يجب أن تكون HH:MM")
        return v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v <= 0:
            raise ValueError("المبلغ يجب أن يكون أكبر من صفر")
        return v


# ─── استجابة ───────────────────────────────────────────

class PaymentResponse(BaseModel):
    id: int
    supplier_id: int
    supplier_name: str
    payment_date: date
    payment_time: str
    amount: Decimal
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedPaymentResponse(BaseModel):
    items: list[PaymentResponse]
    total: int
    total_amount: Decimal
    page: int
    pages: int
    page_size: int


# ─── احتساب الرصيد ─────────────────────────────────────

class SupplierBalanceResponse(BaseModel):
    supplier_id: int
    supplier_name: str
    opening_balance: Decimal
    total_goods_received: Decimal
    total_supplier_returns: Decimal
    net_goods_received: Decimal
    sales_rate: Decimal
    total_already_paid: Decimal
    remaining_deduction: Decimal
    net_after_remaining: Decimal
    suggested_amount: Decimal
