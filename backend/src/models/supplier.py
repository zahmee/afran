from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, field_validator


# ─── SupplierType ──────────────────────────────────────

class SupplierTypeResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SupplierTypeCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("اسم النوع مطلوب")
        return v


# ─── Supplier ──────────────────────────────────────────

class SupplierResponse(BaseModel):
    id: int
    name: str
    type_id: int
    type_name: str | None = None
    sales_rate: Decimal
    opening_balance: Decimal
    deal_terms: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SupplierCreate(BaseModel):
    name: str
    type_id: int
    sales_rate: Decimal = Decimal("0")
    opening_balance: Decimal = Decimal("0")
    deal_terms: str | None = None
    created_at: date | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("اسم المورد مطلوب")
        return v

    @field_validator("sales_rate")
    @classmethod
    def rate_range(cls, v: Decimal) -> Decimal:
        if v < 0 or v >= 100:
            raise ValueError("نسبة المبيعات يجب أن تكون من 0 إلى أقل من 100")
        return v


class SupplierUpdate(BaseModel):
    name: str | None = None
    type_id: int | None = None
    sales_rate: Decimal | None = None
    opening_balance: Decimal | None = None
    deal_terms: str | None = None
    is_active: bool | None = None
    created_at: date | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("اسم المورد مطلوب")
        return v

    @field_validator("sales_rate")
    @classmethod
    def rate_range(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and (v < 0 or v >= 100):
            raise ValueError("نسبة المبيعات يجب أن تكون من 0 إلى أقل من 100")
        return v
