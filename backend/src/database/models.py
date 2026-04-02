from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.db import Base


class UserRole(str, PyEnum):
    ADMIN = "admin"           # مدير النظام
    DATA_ENTRY = "data_entry" # مدخل بيانات
    REPORTS = "reports"       # تقارير


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ─── User ───────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(20), default=UserRole.DATA_ENTRY)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)  # غير فعال حتى يفعّله المدير
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


# ─── SupplierType (نوع المورد) ─────────────────────────
class SupplierType(Base):
    __tablename__ = "supplier_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    suppliers: Mapped[list["Supplier"]] = relationship(back_populates="type_rel")


# ─── Supplier (مورد) ──────────────────────────────────
class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    type_id: Mapped[int] = mapped_column(ForeignKey("supplier_types.id"))
    sales_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0"),
        comment="نسبة المبيعات — رقم من 0 إلى أقل من 100",
    )
    opening_balance: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0"),
        comment="الرصيد الافتتاحي",
    )
    deal_terms: Mapped[str | None] = mapped_column(
        Text, nullable=True,
        comment="نوع التعامل — نص حر متعدد الأسطر",
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    type_rel: Mapped["SupplierType"] = relationship(back_populates="suppliers")
    products: Mapped[list["Product"]] = relationship(back_populates="supplier")
    payments: Mapped[list["Payment"]] = relationship(back_populates="supplier")


# ─── Product ────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"))
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    profit_margin: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2), nullable=True,
        comment="هامش الربح للشركات — None للأسر (تُستخدم commission_rate)",
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    supplier: Mapped["Supplier"] = relationship(back_populates="products")
    sale_items: Mapped[list["SaleItem"]] = relationship(back_populates="product")


# ─── DailySale (فاتورة بيع يومية) ──────────────────────
class DailySale(Base):
    __tablename__ = "daily_sales"

    id: Mapped[int] = mapped_column(primary_key=True)
    sale_date: Mapped[date] = mapped_column(Date, index=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    items: Mapped[list["SaleItem"]] = relationship(back_populates="sale")
    returns: Mapped[list["Return"]] = relationship(back_populates="sale")


# ─── SaleItem (بند مبيعات) ──────────────────────────────
class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("daily_sales.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column()
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    sale: Mapped["DailySale"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="sale_items")


# ─── Return (مرتجعات) ──────────────────────────────────
class Return(Base):
    __tablename__ = "returns"

    id: Mapped[int] = mapped_column(primary_key=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("daily_sales.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column()
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    return_date: Mapped[date] = mapped_column(Date)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    sale: Mapped["DailySale"] = relationship(back_populates="returns")
    product: Mapped["Product"] = relationship()


# ─── Payment (سدادات الموردين / الأسر) ─────────────────
class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    payment_date: Mapped[date] = mapped_column(Date)
    payment_time: Mapped[str] = mapped_column(String(5))  # HH:MM
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    supplier: Mapped["Supplier"] = relationship(back_populates="payments")


# ─── SupplierReturn (مرتجعات الموردين) ──────────────────
class SupplierReturn(Base):
    __tablename__ = "supplier_returns"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"))
    return_date: Mapped[date] = mapped_column(Date, index=True)
    return_time: Mapped[str] = mapped_column(String(5))  # HH:MM
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    supplier: Mapped["Supplier"] = relationship()
    items: Mapped[list["SupplierReturnItem"]] = relationship(
        back_populates="supplier_return", cascade="all, delete-orphan"
    )


# ─── SupplierReturnItem (بنود المرتجعات) ─────────────────
class SupplierReturnItem(Base):
    __tablename__ = "supplier_return_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    return_id: Mapped[int] = mapped_column(ForeignKey("supplier_returns.id"))
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    supplier_return: Mapped["SupplierReturn"] = relationship(back_populates="items")


# ─── GoodsReceipt (استلام البضاعة) ──────────────────────
class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"))
    receipt_date: Mapped[date] = mapped_column(Date, index=True)
    receipt_time: Mapped[str] = mapped_column(String(5))  # HH:MM
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    supplier: Mapped["Supplier"] = relationship()
    items: Mapped[list["GoodsReceiptItem"]] = relationship(
        back_populates="receipt", cascade="all, delete-orphan"
    )


# ─── GoodsReceiptItem (بنود استلام البضاعة) ─────────────
class GoodsReceiptItem(Base):
    __tablename__ = "goods_receipt_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    receipt_id: Mapped[int] = mapped_column(ForeignKey("goods_receipts.id"))
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    remaining: Mapped[int] = mapped_column(
        default=0,
        comment="الباقي (عدد صحيح) — يجب أن يكون صفر أو أكبر",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    receipt: Mapped["GoodsReceipt"] = relationship(back_populates="items")
