---
description: How to develop FastAPI backend endpoints for the Afran project.
---

# Afran FastAPI & Backend Development Guide

When building APIs or modifying the backend for the `afran` project, adhere to these architectural standards.

## 1. Framework Patterns (FastAPI & Python)
- **Async First:** The entire application is designed to be asynchronous. Use `async def` for routers and database interactions.
- **Validation:** Use `Pydantic v2` heavily for incoming and outgoing data schemas.
- **Type Hints:** Ensure every function and object incorporates accurate Python type hinting.

## 2. Database Handling (SQLAlchemy 2.0 Async)
- **Engine:** We use `aiosqlite` for Dev development. Use the async engine configured in `backend/src/database/db.py`.
- **Models:** Define models using imperative tables or new SQLAlchemy 2.0 declarative patterns in `backend/src/database/models.py`.
- **Session Dependency:** Always inject the database session (`AsyncSession`) using the `get_session` dependency in your endpoints.

## 3. Directory Structure
- **Routers:** Every new domain or feature needs its own router file in `backend/src/routers/` (e.g., `products.py`). Remember to include the router in `backend/src/api.py`.
- **Models:** Add ORM changes to `backend/src/database/models.py`. Drop and recreate `afran.db` if making schema changes.
- **Schemas:** Add Pydantic validation files in `backend/src/models/` matching the domain (e.g., `products.py`).

## 4. Auth & Dependencies
- **Authentication:** For secured endpoints, always inject the current user using the dependency found in `backend/src/auth/auth.py`.

## 5. Code Example

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.db import get_session
from database.models import Product
from models.products import ProductCreate, ProductResponse
from auth.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductResponse)
async def create_product(
    payload: ProductCreate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    try:
        new_product = Product(**payload.model_dump())
        session.add(new_product)
        await session.commit()
        await session.refresh(new_product)
        return new_product
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
```

## 6. Seed Data & Database Reset
- **Database Reset:** If you modify tables in `models.py`, delete `afran.db`. The `api.py` lifespan handles recreation automatically.
- **Seeding:** Update the `POST /auth/seed` endpoint immediately to accommodate mock data for any new models you create.
