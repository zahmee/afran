# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**افران (afran)** — نظام لإدارة مبيعات محل أكل شعبي. يبيع منتجات أسر منتجة (بعمولة 15%) ومنتجات شركات (بهوامش ربح متغيرة). يتتبع استلام البضاعة، المرتجعات، وسداد الموردين/الأسر.

Arabic-first web application with full RTL support and dark mode.

## Repository Structure

```
afran/                    ← working directory (root)
├── frontend/             ← Angular 21 app
│   ├── src/app/          ← components, routes, services
│   │   ├── auth/         ← AuthService, guard, interceptor
│   │   ├── login/        ← login page
│   │   ├── register/     ← register page
│   │   ├── dashboard/    ← dashboard page
│   │   ├── suppliers/    ← suppliers page + supplier-dialog (DynamicDialog)
│   │   ├── admin/users/  ← users management + edit-user-dialog (DynamicDialog)
│   │   ├── admin/supplier-types/ ← supplier types management
│   │   ├── app.ts        ← root component (custom sidebar layout)
│   │   ├── app.routes.ts ← lazy-loaded routes
│   │   └── app.config.ts ← providers (PrimeNG, MessageService, etc.)
│   ├── angular.json      ← primeicons.css included in styles
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
- **PrimeNG 19** (UI component library) — لا Angular Material
- **@primeuix/themes/aura** — ثيم PrimeNG
- **primeicons** — أيقونات (`pi pi-*`)
- SCSS per component
- Vitest 4.0 for testing
- Google Fonts: Vazirmatn

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
- **Reactive Forms** — استخدم `ReactiveFormsModule` للفورمات
- **`inject()` function** instead of constructor injection
- **`input()`/`output()` functions** instead of decorators
- RTL layout: `index.html` has `lang="ar" dir="rtl"`
- Dark mode: toggled via `html.dark-mode` class, persisted in localStorage

### Layout
- **Sidebar مخصص** بـ CSS خالص (لا `mat-sidenav`) — قائمة جانبية داكنة `#0f172a`
- القائمة تطوي إلى أيقونات فقط عند الضغط على زر القائمة (`[class.collapsed]`)
- `p-toast` في `app.html` لعرض الإشعارات من أي مكون

### PrimeNG Usage Patterns
- **Dialog**: `DialogService` + `DynamicDialogRef` من `primeng/dynamicdialog`
  - يُضاف `providers: [DialogService]` في المكون الفتّاح
  - يُستخدم `inject(DynamicDialogConfig).data` في مكون الـ dialog
- **Toast**: `MessageService` مُسجّل في `app.config.ts`، يُحقن مباشرة في المكون
- **ToggleSwitch**: يستخدم `[(ngModel)]` مع `FormsModule` — لا يوجد `[checked]` أو `[modelValue]` كـ input
- **Select**: يستخدم `[(ngModel)]` مع `FormsModule` أو `formControlName` مع `ReactiveFormsModule`
- **Table**: `p-table` مع `<ng-template #header>` و `<ng-template #body let-item>`
- **Icons**: `<i class="pi pi-[name]"></i>` — لا Material Symbols

### Backend
- **Entry**: `backend/src/api.py` — registers all routers, creates tables on startup
- **DB models**: `backend/src/database/models.py` — SQLAlchemy ORM
- **Pydantic models**: `backend/src/models/` — one file per domain
- **Routers**: `backend/src/routers/` — one file per domain
- **Auth**: JWT via `CurrentUser` dependency in `backend/src/auth/auth.py`
- **Config**: `backend/src/config.py` — pydantic-settings with .env support

## Navigation Items

| التسمية | الأيقونة | المسار |
|---------|---------|--------|
| الرئيسية | `pi-home` | `/dashboard` |
| استلام البضاعة | `pi-shopping-cart` | `/sales` |
| الموردين | `pi-users` | `/suppliers` |
| المنتجات | `pi-box` | `/products` |
| المرتجعات | `pi-undo` | `/returns` |
| السدادات | `pi-wallet` | `/payments` |
| المستخدمين (admin) | `pi-user-edit` | `/admin/users` |
| أنواع الموردين (admin) | `pi-tags` | `/admin/supplier-types` |

## Database Models

- **User** — id, username, password_hash, full_name, role (admin/data_entry/reports), is_active
- **SupplierType** — id, name (جدول أنواع الموردين: شركات ومؤسسات، أسر منتجة)
- **Supplier** — id, name, type_id (FK→supplier_types), sales_rate, opening_balance, deal_terms
- **Product** — id, name, supplier_id (FK), category, unit_price, profit_margin
- **DailySale** — id, sale_date, total_amount, notes, created_by (FK)
- **SaleItem** — id, sale_id (FK), product_id (FK), quantity, unit_price, total
- **Return** — id, sale_id (FK), product_id (FK), quantity, reason, return_date, created_by
- **Payment** — id, supplier_id (FK), amount, payment_date, notes, created_by

## Business Logic

- **نسبة المبيعات**: رقم من 0 إلى أقل من 100 — تُحدد لكل مورد
- **أنواع الموردين**: جدول مرجعي (شركات ومؤسسات، أسر منتجة) — قابل للإضافة
- **المرتجعات**: ترتبط بفاتورة بيع ومنتج محدد
- **السدادات**: دفعات للموردين (أسر/شركات) مع تاريخ وملاحظات

## File Naming

Components use flat naming without `.component` suffix:
- `login/login.ts`, `login/login.html`, `login/login.scss`
- Class names are PascalCase without `Component` suffix (e.g., `export class Login`)

## Development Guidelines

- **Always use the latest APIs and patterns** — use the most current, recommended approaches for each library and framework
- **Avoid deprecated features** — لا `@primeng/themes` (deprecated في v19)، استخدم `@primeuix/themes`
- **Frontend**: prefer Angular's latest APIs (signals over BehaviorSubject, `inject()` over constructor DI, native control flow over structural directives)
- **Backend**: prefer modern Python patterns (async/await, type hints, Pydantic v2, SQLAlchemy 2.0)
- **Dependencies**: when adding new packages, use the latest stable versions

## Database Reset & Seed (Development)

عند تعديل أي شيء في نماذج قاعدة البيانات (models.py):
1. **احذف ملف قاعدة البيانات** `backend/afran.db`
2. **أعد تشغيل السيرفر** — الجداول تُنشأ تلقائياً عند التشغيل
3. **أضف بيانات تجريبية** في كل الجداول للتجربة عبر `POST /auth/seed`

يجب أن يقوم endpoint الـ seed بإنشاء:
- **مستخدم مدير**: admin / admin123 (مفعّل، صلاحية admin)
- **مستخدم عادي**: user1 / user123 (مفعّل، صلاحية data_entry)
- **أنواع موردين**: شركات ومؤسسات، أسر منتجة، مخابز
- **موردين**: 3-4 موردين متنوعين مرتبطين بأنواع مختلفة
- **منتجات**: 5-6 منتجات مرتبطة بالموردين
- **مبيعات يومية**: 2-3 فواتير بيع مع بنود
- **مرتجعات**: 1-2 مرتجع
- **سدادات**: 1-2 دفعة لموردين

هذا يضمن أن كل الشاشات فيها بيانات للتجربة مباشرة بعد إعادة ضبط القاعدة.

## Important Note
After every major change, update this file (CLAUDE.md) to reflect the current project status.
