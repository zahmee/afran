# 🌟 Afran (أفران) - Project Documentation

> [!NOTE] 
> **نظام لإدارة مبيعات محل أكل شعبي (Afran)**. 
> يبيع منتجات أسر منتجة (بعمولة 15%) ومنتجات شركات (بهوامش ربح متغيرة). يتتبع استلام البضاعة، المرتجعات، وسداد الموردين/الأسر.
> **Design:** Arabic-first web application with full RTL support and dark mode.

---

## 📂 1. Repository Structure

```text
afran/                    ← working directory (root)
├── frontend/             ← Angular 21 app
│   ├── src/app/          ← components, routes, services
│   │   ├── auth/         ← AuthService, guard, interceptor
│   │   ├── login/        ← login page
│   │   ├── register/     ← register page
│   │   ├── dashboard/    ← dashboard page
│   │   ├── suppliers/    ← suppliers page + supplier-dialog
│   │   ├── admin/users/  ← users management + edit-user-dialog 
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
│   │   ├── database/     ← db.py (engine/session), models.py (ORM)
│   │   ├── auth/         ← auth.py (JWT + Dependency)
│   │   ├── models/       ← Pydantic schemas
│   │   └── routers/      ← API endpoints
│   ├── main.py           ← uvicorn entry (port 8011)
│   └── pyproject.toml
└── CLAUDE.md
```

---

## 🚀 2. Quick Start & Commands

### 🎨 Frontend
*Run from the `frontend/` directory:*
- **Start Dev Server:** `npm start` (Runs at http://localhost:4200/)
- **Production Build:** `npm run build`
- **Run Tests:** `npm test` (Unit tests via Vitest + jsdom)

### ⚙️ Backend
*Run from the `backend/` directory:*
- **Start Dev Server:** `uv run python main.py` (Runs at http://localhost:8011/ with uvicorn reload)
- **Install/Sync Deps:** `uv sync`
- **Seed Database:** `POST http://localhost:8011/auth/seed` (Creates default admin `admin`/`admin123` and mock data)

---

## 🛠️ 3. Tech Stack

### Frontend Stack 
- **Framework:** Angular 21, TypeScript 5.9, RxJS 7.8
- **UI Library:** PrimeNG 19 (No Angular Material used)
- **Theme:** `@primeuix/themes/aura`
- **Icons:** `primeicons` (`pi pi-*` classes)
- **Styling:** SCSS per component
- **Testing:** Vitest 4.0
- **Typography:** Google Fonts (Vazirmatn)

### Backend Stack
- **Framework:** FastAPI, Python 3.14 (or latest 3.x)
- **Database:** SQLAlchemy 2.0 (async) with aiosqlite (SQLite for dev)
- **Validation:** Pydantic 2
- **Auth:** JWT auth (python-jose + passlib/bcrypt)

---

## 🏗️ 4. Architecture & Best Practices

> [!IMPORTANT]  
> **Always use the latest APIs and patterns.** Avoid deprecated features (e.g., use `@primeuix/themes` instead of deprecated `@primeng/themes`).

### Frontend Architecture
- **Standalone Only:** No `NgModules`. (Note: Do NOT explicitly set `standalone: true` as it is default in Angular v21).
- **State Management:** Use **Signals** (`signal()`, `computed()`) exclusively for all state.
- **Change Detection:** `ChangeDetectionStrategy.OnPush` on ALL components.
- **Dependency Injection:** Use the `inject()` function instead of constructor injection.
- **Inputs/Outputs:** Use `input()` and `output()` functions instead of decorators.
- **Routing & Flow:** Lazy loading for feature routes. Native control flow (`@if`, `@for`, `@switch`).
- **Forms:** Use `ReactiveFormsModule` for form binding.
- **Layout:** 
  - RTL design: `index.html` uses `lang="ar" dir="rtl"`.
  - Dark mode toggled via `html.dark-mode` class (persisted in localStorage).
  - Custom pure CSS sidebar (Dark `#0f172a`), collapses to icons (`[class.collapsed]`).

### PrimeNG Usage Patterns
- **Dialogs:** `DialogService` + `DynamicDialogRef` from `primeng/dynamicdialog`.
  - Provide `DialogService` in the opening component.
  - Read data via `inject(DynamicDialogConfig).data`.
- **Toasts:** `MessageService` is registered in `app.config.ts` and injected directly; using `p-toast` in `app.html` for global display.
- **Form Controls:** 
  - `ToggleSwitch` & `Select`: Use `[(ngModel)]` or `formControlName`. No `[checked]` or `[modelValue]`.
- **Tables:** `p-table` with `<ng-template #header>` and `<ng-template #body let-item>`.
- **Icons:** Use `<i class="pi pi-[name]"></i>`. **DO NOT** use Material Symbols.

### Backend Architecture
- **App Entry:** `backend/src/api.py` registers all routers and triggers table creation on startup.
- **Database ORM:** Defined in `backend/src/database/models.py`.
- **Schemas:** One file per domain under `backend/src/models/` (Pydantic models).
- **Routers:** One file per domain under `backend/src/routers/`.
- **Auth:** JWT validation via `CurrentUser` dependency in `backend/src/auth/auth.py`.

---

## 🗃️ 5. Database & Business Logic

### Business Concepts
- **أنواع الموردين (Supplier Types):** Reference table (e.g., شركات ومؤسسات، أسر منتجة، مخابز).
- **نسبة المبيعات (Sales Rate):** Specific percentage (0 to <100) defined per supplier.
- **المرتجعات (Returns):** Directly tied to a specific sale invoice and a product.
- **السدادات (Payments):** Payments processed for suppliers (companies/families) with timestamps and notes.

### Core Entities
| Entity | Description |
|--------|-------------|
| **User** | System users with roles (admin, data_entry, reports). |
| **SupplierType** | Category of supplier. |
| **Supplier** | Associates with a type, tracking rate, balance, and terms. |
| **Product** | Has supplier_id, category, unit_price, and profit_margin. |
| **DailySale / SaleItem** | Invoices capturing multiple product lines per transaction. |
| **Return** | Tracked per invoice line item with a reason. |
| **Payment** | Deductions/Payments made to suppliers. |

---

## 🗺️ 6. Navigation Routes

| التسمية (Label) | الأيقونة (Icon) | المسار (Route) |
|------------------|-----------------|----------------|
| الرئيسية | `pi-home` | `/dashboard` |
| استلام البضاعة | `pi-shopping-cart` | `/sales` |
| الموردين | `pi-users` | `/suppliers` |
| المنتجات | `pi-box` | `/products` |
| المرتجعات | `pi-undo` | `/returns` |
| السدادات | `pi-wallet` | `/payments` |
| المستخدمين | `pi-user-edit` | `/admin/users` |
| أنواع الموردين | `pi-tags` | `/admin/supplier-types` |

---

## 🔄 7. Development Guidelines & Database Reset

### File Naming Convention
- **Components:** Flat naming without `.component` suffix (e.g., `login/login.ts`, `login/login.html`).
- **Classes:** PascalCase without `Component` suffix (e.g., `export class Login`).

### Database Reset Workflow
> [!TIP]  
> عند تعديل أي شيء في نماذج قاعدة البيانات (`models.py`)، اتبع الآتي لتحديثها للنسخة الأحدث:
1. **احذف ملف قاعدة البيانات:** `backend/afran.db`
2. **أعد تشغيل السيرفر:** ستُنشأ الجداول تلقائياً (عبر الحدث الخاص ببدء التشغيل).
3. **أضف بيانات تجريبية (Seed):** شغل الطلب `POST /auth/seed`. سيوفر هذا بيانات جاهزة لاختبار واجهات التطبيق (مستخدم مسؤؤل وعادي، مصادر منتجات، فواتير مبيعات ومرتجعات ودفعات).

> [!WARNING]  
> After every major change, update this file (CLAUDE.md) to reflect the current project status.
