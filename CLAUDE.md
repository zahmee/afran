# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**عفران (afran)** — نظام لإدارة مبيعات محل أكل شعبي. يبيع منتجات أسر منتجة (بعمولة 15%) ومنتجات شركات (بهوامش ربح متغيرة). يتتبع المبيعات اليومية، المرتجعات، وسداد الموردين/الأسر.

Arabic-first web application with full RTL support and dark mode.

## Repository Structure

```
afran/                    ← working directory (root)
├── frontend/             ← Angular 21 app
│   ├── src/app/          ← components, routes, services
│   │   ├── auth/         ← AuthService, guard, interceptor
│   │   ├── login/        ← login page
│   │   ├── dashboard/    ← dashboard page
│   │   ├── app.ts        ← root component (sidenav layout)
│   │   ├── app.routes.ts ← lazy-loaded routes
│   │   └── app.config.ts ← providers
│   ├── angular.json
│   └── package.json
├── backend/              ← FastAPI app
│   ├── src/
│   │   ├── api.py        ← FastAPI app + router registration
│   │   ├── config.py     ← settings (DB URL, JWT, etc.)
│   │   ├── database/
│   │   │   ├── db.py     ← SQLAlchemy async engine + session
│   │   │   └── models.py ← ORM models
│   │   ├── auth/
│   │   │   └── auth.py   ← JWT + CurrentUser dependency
│   │   ├── models/       ← Pydantic schemas
│   │   └── routers/      ← API endpoints
│   ├── main.py           ← uvicorn entry (port 8011)
│   └── pyproject.toml
└── CLAUDE.md
```

## Commands

### Frontend (run from `frontend/`)
- `cd frontend && npm start` — Dev server at http://localhost:4200/
- `cd frontend && npm run build` — Production build
- `cd frontend && npm test` — Unit tests (Vitest + jsdom)

### Backend (run from `backend/`)
- `cd backend && uv run python main.py` — Dev server at http://localhost:8011/ (uvicorn with reload)
- `cd backend && uv sync` — Install/sync Python dependencies
- POST `http://localhost:8011/auth/seed` — Create default admin (admin/admin123)

## Tech Stack

### Frontend
- Angular 21, TypeScript 5.9, RxJS 7.8
- Angular Material + Angular CDK (RTL, theming, components)
- SCSS per component
- Vitest 4.0 for testing
- Google Fonts: Vazirmatn, Material Symbols Outlined

### Backend
- FastAPI, Python 3.14
- SQLAlchemy 2.0 (async) with aiosqlite (SQLite for dev)
- Pydantic 2 for validation
- JWT auth (python-jose + passlib/bcrypt)

## Architecture

### Frontend
- **Standalone components** (no NgModules) — do NOT set `standalone: true` (default in Angular v21)
- **Signals** (`signal()`, `computed()`) for all state
- **`ChangeDetectionStrategy.OnPush`** on all components
- **Lazy loading** for all feature routes
- **Native control flow** (`@if`, `@for`, `@switch`)
- **Reactive Forms** only
- **`inject()` function** instead of constructor injection
- **`input()`/`output()` functions** instead of decorators
- RTL layout: `index.html` has `lang="ar" dir="rtl"`
- Dark mode: toggled via `html.dark-mode` class, persisted in localStorage

### Backend
- **Entry**: `backend/src/api.py` — registers all routers, creates tables on startup
- **DB models**: `backend/src/database/models.py` — SQLAlchemy ORM
- **Pydantic models**: `backend/src/models/` — one file per domain
- **Routers**: `backend/src/routers/` — one file per domain
- **Auth**: JWT via `CurrentUser` dependency in `backend/src/auth/auth.py`
- **Config**: `backend/src/config.py` — pydantic-settings with .env support

## Database Models

- **User** — id, username, password_hash, full_name, role (admin/user), is_active
- **Supplier** — id, name, supplier_type (family/company), commission_rate, phone, notes
- **Product** — id, name, supplier_id (FK), category, unit_price, profit_margin
- **DailySale** — id, sale_date, total_amount, notes, created_by (FK)
- **SaleItem** — id, sale_id (FK), product_id (FK), quantity, unit_price, total
- **Return** — id, sale_id (FK), product_id (FK), quantity, reason, return_date, created_by
- **Payment** — id, supplier_id (FK), amount, payment_date, notes, created_by

## Business Logic

- **أسر منتجة (family)**: عمولة ثابتة 15% — المحل يأخذ 15% والباقي يعود للأسرة
- **شركات (company)**: هامش ربح متغير حسب المنتج — يُحدد في `Product.profit_margin`
- **المرتجعات**: ترتبط بفاتورة بيع ومنتج محدد
- **السدادات**: دفعات للموردين (أسر/شركات) مع تاريخ وملاحظات

## File Naming

Components use flat naming without `.component` suffix:
- `login/login.ts`, `login/login.html`, `login/login.scss`
- Class names are PascalCase without `Component` suffix (e.g., `export class Login`)

## Important Note
After every major change, update this file (CLAUDE.md) to reflect the current project status.
