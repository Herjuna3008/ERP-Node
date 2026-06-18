# CLAUDE.md — CuanFlow ERP/CRM (ERP-Node)

Guidance for AI assistants and engineers working in this repo. Read this first, then
[HANDOVER.md](HANDOVER.md) for the deep architecture + known-bug detail.

> CuanFlow is a fork/rebrand of the IDURAR ERP/CRM. Backend was migrated from MongoDB/Mongoose
> to **TypeORM + MySQL**. Frontend still carries some legacy IDURAR naming.

## Stack
- **Backend**: Node 20+, Express 4, TypeORM 0.3 (MySQL via mysql2), JWT auth, Joi validation.
  Module alias `@` → `backend/src`.
- **Frontend**: React 18 + Vite 5 + Ant Design 5 + Redux Toolkit + react-router-dom 6.
- **DB**: MySQL (legacy 5.5 compatibility shims live in `backend/src/typeorm-data-source.js`).

## Run
```bash
# from repo root — runs backend + frontend together
npm run dev

# or individually
cd backend  && npm run dev      # nodemon, http://localhost:8888
cd frontend && npm run dev      # Vite, http://localhost:5173 (calls backend :8888/api)
```
- Backend needs `backend/.env` (and/or `.env.local`): `JWT_SECRET` (**required**), DB vars
  `DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME` (or `DATABASE_URL` / `MYSQL*`). DB name defaults to `erp`.
- **Schema bootstrap**: `synchronize: false`. On an **empty** database the app runs a one-time
  `synchronize()` + creates MySQL triggers for `created`/`date` columns, then `runMigrations()`.
  The `migrations/` dir is currently **empty** — there are no incremental migrations yet.
- Seed/admin: `cd backend && npm run setup` (and `npm run reset`). A demo admin is bootstrapped
  on first empty-DB run via `setup/bootstrapDefaults.js`.

## Architecture you must understand before editing

### Routing is auto-wired from entities
1. `models/utils/index.js` globs `entities/*.js` → builds `routesList` (excludes
   `Admin, AdminPassword, Setting, InvoiceItem`). Each entity `Foo` → `entity: 'foo'`,
   `controllerName: 'fooController'`.
2. `controllers/appControllers/index.js` globs `appControllers/*/` dirs. If a `fooController`
   dir exists → that **custom controller** is used; otherwise a **generic CRUD controller**
   (`createCRUDController(repo)`) is generated.
3. `routes/appRoutes/appApi.js` registers **action-suffix** routes for every entity:
   `/<entity>/create | read/:id | update/:id | delete/:id | list | listAll | search | filter | summary`
   plus `/<entity>/mail` (invoice/quote/payment), `/invoices/:id/payments`, `/quotes/:id/convert`.

➡️ **To add an entity**: create `entities/Foo.js` and it auto-gets generic CRUD. Add a custom
controller dir only when you need business logic.

### Two API surfaces
- **appApi** (`/api/<entity>/...`, action-suffix) — what the frontend calls for all ERP entities.
- **coreApi** (admin, settings).
- Master-data write protection: `product` / `supplier` **create/update/delete** are guarded by
  `rbac(['owner','admin','manager'])` directly in `appApi.js` (reads stay open so invoice/quote item
  pickers work for every role). The old dead REST `masterDataRoutes` (`/api/products`) and its
  `masterData/*` controllers/services were **removed** — see HANDOVER bug **C**.

### Custom vs generic controllers
Custom (have business logic): `invoice, quote, payment, purchaseinvoice, stockledger, recap,
product` (product's custom create/update turn a stock value typed in the form into an `adjustment`
ledger entry — stock stays ledger-derived).
Generic raw CRUD: `client, taxes, paymentmode, expense, expensecategory, supplier, …`.

### Business logic lives in services, not controllers
`backend/src/services/*` is the source of truth for totals, stock, payment status, recap.
Read the relevant service before changing a flow.

### Data model conventions
- **Sales docs** (`Invoice`, `Quote`) store line `items` as a **`simple-json` blob**, NOT
  relations. `InvoiceItem` / `PurchaseItem` entities exist but are **unused/orphan**.
- **Purchase docs** use real relations (`PurchaseInvoice` 1—* `PurchaseInvoiceItem`, cascade).
- **Stock**: `stock_ledger` is the history of truth (`IN`/`OUT`). `Product.stockQuantity`,
  `lastCostPrice`, `lastSellPrice` are aggregates **derived** from the ledger by
  `recalculateProductAggregates` (idempotent, replays from zero). Purchases write `IN` on `sent`;
  sales write `OUT` when the invoice is non-draft (`invoiceStockService.syncInvoiceStock`); the
  product form's stock value is captured as an `adjustment` entry. Don't write these columns directly.
- **Auth/session**: JWT tokens are also stored in `AdminPassword.loggedSessions` (JSON array).
  Every request checks `token ∈ loggedSessions`; **logout removes the token** (real invalidation).
- **Dates**: every `type: 'date'` column is MySQL `DATE` (date-only). `typeorm-data-source.js`
  (`normalizeDateOnlyColumns`) attaches a transformer that coerces any written value (the FE sends
  full ISO `…T…Z` timestamps) to `YYYY-MM-DD`. Don't re-add per-controller date parsing — see HANDOVER **J**.

### Frontend conventions
- All API calls use the **action-suffix** shape via `request/request.js`
  (`createCrudService('product')` → `/product/create`, `/product/list`, …). No REST shape anywhere.
- JWT `Bearer` token comes from localStorage; `401` / `jwtExpired` → wipe + redirect `/logout`.
- `CrudModule` = simple master-data pages (table + side panel). `ErpPanelModule` = full-page
  workflow entities (invoice/quote/payment). Domain modules pass `{ entity, fields, searchConfig }`.

## Working rules for this repo
- Follow existing patterns; don't introduce a new architecture because it "feels cleaner".
- Before changing any flow, check the chain: **entity → service → controller → route → FE module → recap**.
- Always reason about side effects on: invoice total, payment status, stock quantity, stock-ledger
  history, recap/profit.
- Status casing convention (HANDOVER bug **F**, fixed): `invoice.paymentStatus` is canonical
  **lowercase** `unpaid|paid|partially`; `invoice`/`purchaseInvoice` `status` are lowercase
  (`draft|pending|sent`); `quote.status` is an UPPER enum (`DRAFT|SENT|CONVERTED`). Match the target
  field's casing and don't "normalize" globally without checking all readers (FE `statusTagColor`,
  `invoiceController/summary`, i18n keys).
- Keep changes small and safe. When a fix needs a design decision (e.g. stock opening balance),
  surface it before editing.

## Known issues
A full, verified, ranked list with file:line and fix direction is in **[HANDOVER.md](HANDOVER.md)
→ Known Bugs**. Fixed: sales stock OUT (A), aggregate double-count (B), master-data RBAC (C),
recap discount + converted-invoice visibility (D, E), paymentStatus casing (F), `discount` overload
(G). Still open (low priority): orphan entities (H), FE-driven numbering (I).
