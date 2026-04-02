from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, field_validator


# ─── بنود الاستلام ─────────────────────────────────────

class GoodsReceiptItemCreate(BaseModel):
    quantity: Decimal
    unit_price: Decimal
    total: Decimal

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("العدد يجب أن يكون أكبر من صفر")
        return v

    @field_validator("unit_price")
    @classmethod
    def price_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("المبلغ يجب أن يكون أكبر من صفر")
        return v


class GoodsReceiptItemResponse(BaseModel):
    id: int
    quantity: Decimal
    unit_price: Decimal
    total: Decimal

    model_config = {"from_attributes": True}


# ─── استلام البضاعة ────────────────────────────────────

class GoodsReceiptCreate(BaseModel):
    supplier_id: int
    receipt_date: date
    receipt_time: str  # HH:MM
    items: list[GoodsReceiptItemCreate]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("يجب إدخال بند واحد على الأقل")
        return v

    @field_validator("receipt_time")
    @classmethod
    def time_format(cls, v: str) -> str:
        v = v.strip()
        parts = v.split(":")
        if len(parts) != 2 or not all(p.isdigit() for p in parts):
            raise ValueError("صيغة الوقت غير صحيحة — يجب أن تكون HH:MM")
        return v


class GoodsReceiptUpdate(BaseModel):
    supplier_id: int | None = None
    receipt_date: date | None = None
    receipt_time: str | None = None
    items: list[GoodsReceiptItemCreate] | None = None

    @field_validator("receipt_time")
    @classmethod
    def time_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        parts = v.split(":")
        if len(parts) != 2 or not all(p.isdigit() for p in parts):
            raise ValueError("صيغة الوقت غير صحيحة — يجب أن تكون HH:MM")
        return v


class GoodsReceiptResponse(BaseModel):
    id: int
    supplier_id: int
    supplier_name: str
    receipt_date: date
    receipt_time: str
    total_amount: Decimal
    items_count: int
    created_at: datetime
    items: list[GoodsReceiptItemResponse]

    model_config = {"from_attributes": True}


class PaginatedGoodsReceiptResponse(BaseModel):
    items: list[GoodsReceiptResponse]
    total: int
    page: int
    pages: int
    page_size: int
