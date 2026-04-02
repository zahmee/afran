from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from src.database.db import Base, engine, async_session
from src.database.models import SupplierType
from src.routers import auth, goods_receipt, suppliers


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default supplier types
    async with async_session() as db:
        result = await db.execute(select(SupplierType))
        if not result.scalars().first():
            db.add_all([
                SupplierType(name="شركات ومؤسسات"),
                SupplierType(name="أسر منتجة"),
            ])
            await db.commit()

    yield


app = FastAPI(title="افران API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(suppliers.router)
app.include_router(goods_receipt.router)


@app.get("/")
async def root():
    return {"message": "مرحباً بك في افران API"}
