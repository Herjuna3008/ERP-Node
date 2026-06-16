# HANDOVER — CuanFlow ERP/CRM (ERP-Node)

Engineering handover & architecture reference. Companion to [CLAUDE.md](CLAUDE.md).
Last reviewed: 2026-06-16. All findings below were verified against the code, not assumed.

---

## 1. What this system is
A single-tenant ERP/CRM for a trading business. Core domains: **Client, Quote, Sales Invoice,
Payment, Product, Supplier, Purchase Invoice, Stock Ledger, Expense, Tax, Payment Mode, Settings,
Recap report**. Forked/rebranded from IDURAR; backend migrated to TypeORM + MySQL.

## 2. Layout
```
backend/src/
  app.js                     Express app + route mounting
  server.js                  boot: init DataSource → listen :8888
  typeorm-data-source.js     DataSource, MySQL 5.5 compat shims, schema bootstrap, triggers
  entities/                  TypeORM EntitySchemas (data model = source of truth for tables)
  services/                  BUSINESS LOGIC (totals, stock, payment status, recap, quote convert)
  controllers/
    appControllers/          per-domain controllers (custom or auto-generic)
    coreControllers/         adminAuth, adminController, settingController, setup
    masterData/              product/supplier controllers (REST routes, see bug C)
    middlewaresControllers/  createCRUDController (generic), createAuthMiddleware
  routes/
    appRoutes/appApi.js      action-suffix routes for all entities (what FE calls)
    coreRoutes/              auth, core api, download, public
    masterDataRoutes.js      REST /products /suppliers with RBAC (effectively dead)
  middlewares/               rbac.js, settings/*, inventory/*
  models/utils/index.js      builds routesList from entity files (auto-wiring)
  setup/                     bootstrapDefaults, defaultSettings/*.json, reset
  migrations/                EMPTY (schema comes from synchronize-on-empty + triggers)

frontend/src/
  router/                    routes.jsx, AppRouter, AuthRouter
  redux/                     auth, crud, erp, adavancedCrud, settings slices
  request/                   axios wrapper, action-suffix endpoint builder, 401 handling
  modules/                   CrudModule (master data), ErpPanelModule (workflow docs), domain modules
  pages/                     route-level pages
```

## 3. Request lifecycle
`client → /api/* → cookieParser + json → adminAuth.isValidAuthToken → router → catchErrors(controller) → repository → MySQL`.
Everything under `/api` is auth-gated except the login/forget/reset routes in `coreAuth`.

## 4. Auth & session (verified working)
- Login: `bcrypt.compare(salt + password, hash)`; JWT `{ id }`, expiry 24h (or 365d if "remember").
- Sessions: stored in `AdminPassword.loggedSessions` (JSON array of issued tokens).
  - `authUser.js` pushes the new token on login.
  - `isValidAuthToken.js` verifies the JWT **and** requires `token ∈ loggedSessions`.
  - `logout.js` removes that token (or clears all if none supplied) → **real server-side logout**.
- Minor hardening TODO: `logout.js` doesn't null-check the password row (crashes if missing);
  `loggedSessions` is never pruned of expired tokens (unbounded array growth).

## 5. Business flows (end-to-end)

### Sales: Quote → Invoice → Payment
1. **Quote** created (`status` enum `DRAFT|SENT|CONVERTED`).
2. **Convert** (`/quotes/:id/convert` → `services/quoteService.js`): allowed only when
   `status === 'SENT'` and not already converted. Copies number/items/totals into a new Invoice,
   marks quote `CONVERTED`. ⚠️ Does **not** set the new invoice's `status` (see bug E) and copies
   the quote `number` verbatim (see bug I).
3. **Invoice create** (`controllers/appControllers/invoiceController/create.js`): recomputes totals
   via `services/invoiceCalculationService.js`, stores `items` as JSON, sets initial `paymentStatus`,
   assigns pdf name, increments `last_invoice_number` setting.
4. **Payment**: `/payment/create` (paymentController) or `/invoices/:id/payments`
   (invoiceController.payments). Recomputes invoice payment via
   `services/invoiceService.updateInvoicePayment`: `due = total - discount - paid` →
   `PAID | PARTIAL | UNPAID`, writes `credit` and `payment[]`.
5. ⚠️ **No stock movement** happens anywhere in the sales chain (see bug A).

### Purchase → Stock IN
`services/purchaseInvoiceService.js`:
- Create/update recompute totals (per-line discount → global discount → tax).
- `applyStatusTransitionEffects`: when `status === 'sent'`, writes a stock-ledger **IN** entry per
  item (`costPrice = netUnitPrice`). Leaving `sent`, deleting, or re-saving while `sent`
  removes-by-source then re-adds → idempotent at the invoice level. ✅
- **Stock-to-buy** report = aggregate item quantities across invoices whose status ∈
  `{sent, confirmed, stock_to_buy}` (with alias normalization).

### Stock ledger & product aggregates
`services/stockLedgerService.js`:
- `recordEntry()` saves a ledger row then calls `recalculateProductAggregates()`.
- `recalculateProductAggregates()` recomputes `stockQuantity / lastCostPrice / lastSellPrice`.
  ⚠️ It initializes the running quantity from the **current** `product.stockQuantity` and then
  re-adds the whole ledger → non-idempotent / double-counting (see bug B).
- Manual adjustments go through `stockLedgerController` (source type `adjustment`).

### Recap / profit
`services/recapService.js`: for a date range, sums `invoice.total` (sales) and `purchaseInvoice.total`
(purchases) where `status != 'draft'`, plus expenses; `profit = sales - purchases - expenses`.
Also builds an XLSX export. ⚠️ Reads raw `invoice.total` (see bug D) and excludes `draft` invoices
(see bug E).

### Settings & numbering
`Setting(settingCategory, settingKey, settingValue: json)`. Seeded from
`setup/defaultSettings/*.json`. `last_invoice_number` is incremented by `+1` after invoice create.
Numbering is effectively frontend-driven (the client supplies `number`), not server-authoritative.

## 6. Data model essentials
- **Sales docs (`Invoice`, `Quote`)**: `items` is a `simple-json` blob, **not** a relation.
  `InvoiceItem` / `PurchaseItem` entities and `purchaseInvoiceItemController` exist but are
  **unused/orphan surface**.
- **Purchase docs**: real relations, `PurchaseInvoice` 1—* `PurchaseInvoiceItem` (cascade).
- **`stock_ledger`**: `entryType (IN/OUT)`, `quantity`, `costPrice`, `sellPrice`, `sourceType`,
  `sourceId`, `sourceItemId`, `product` (CASCADE), optional `invoice`/`purchaseInvoice` links.
- **Status fields** (inconsistent casing — see bug F):
  - `Invoice.status` default `'draft'` (lower) + `Invoice.paymentStatus` default `'UNPAID'` (upper).
  - `PurchaseInvoice.status` default `'draft'` (lower).
  - `Quote.status` ENUM `DRAFT|SENT|CONVERTED` (upper) + `converted` boolean.

## 7. Frontend wiring
- **Router** (`router/routes.jsx`): `/`(Dashboard), `/customer`, `/invoice` (+`/create`,`/read/:id`,
  `/update/:id`, `/pay/:id`), `/quote*`, `/payment*`, `/product`, `/supplier`, `/purchaseinvoice`,
  `/purchaseinvoice/stock-to-buy`, `/stock/ledger`, `/expense`, `/expense/category`,
  `/reports/recap`, `/settings*`, `/taxes`, `/payment/mode`, `/profile`.
- **Redux**: `auth` (login state), `crud` (simple master data), `erp` (invoice/quote/payment),
  `adavancedCrud`, `settings`.
- **Request layer** (`request/request.js`): base `…/api/`, **action-suffix** endpoints
  (`/product/create`, `/invoice/read/:id`, …), `Bearer` token from localStorage,
  `401`/`jwtExpired` → clear storage + redirect `/logout`.
- **Modules**: `CrudModule` (table + side panel for master data), `ErpPanelModule` (full-page
  invoice/quote/payment workflow). Domain modules supply `{ entity, fields, searchConfig }`.

---

## 8. KNOWN BUGS (verified, ranked)

> Severity: 🔴 high (data/stock/security correctness) · 🟡 medium · 🔵 low/cleanup.
> None have been fixed yet — this is a findings log.

### 🔴 A. Sales invoices never decrement stock
`ENTRY_TYPES.OUT` and `SOURCE_TYPES.SALES_INVOICE` are defined but have **zero callers** (only
purchases write `IN`, plus manual adjustments). Selling goods does not reduce `stockQuantity` or
write an `OUT` ledger row. Inventory only ever grows.
- Files: `services/stockLedgerService.js`, `services/invoiceService.js`, `invoiceController/*`.
- Fix direction: on sales invoice reaching `sent`/confirmed, write `OUT` ledger entries per item
  (mirror `purchaseInvoiceService.applyStatusTransitionEffects`); reverse on un-send/delete. Needs a
  decision on which status triggers stock-out and whether to block overselling.

### 🔴 B. `recalculateProductAggregates` double-counts stock
`services/stockLedgerService.js:30` initializes `stockQuantity = product.stockQuantity` (the already
stored aggregate) and then adds the **entire** ledger on top. Not idempotent: the 2nd ledger entry
for a product already over-counts.
- Fix direction: start the running total at `0` (or from an explicit opening balance) and sum the
  full ledger. **Design decision needed**: `Product` has no `openingStock` column and
  `productService.create` passes the raw body, so a manually entered initial `stockQuantity` would
  be wiped on the first ledger event. Options: (a) add `openingStock` column, or (b) require initial
  stock to be entered as an `adjustment` ledger entry and treat `stockQuantity` as fully derived.

### 🔴 C. Master-data RBAC is bypassed
RBAC (`owner`/`manager`) is only applied on the **REST** routes `/api/products`, `/api/suppliers`
(`routes/masterDataRoutes.js`). But the frontend and `appApi.js` use the **action-suffix** path
`/api/product/*`, `/api/supplier/*`, which is generated as **generic CRUD with no RBAC**. So any
authenticated admin (any role) can CRUD products/suppliers. Two parallel product/supplier code paths
also exist (generic CRUD vs `masterData/*Service`).
- Fix direction: either route the action-suffix product/supplier endpoints through RBAC, or remove
  the dead REST routes and add an RBAC guard in the generic path for these entities. Pick one code
  path and delete the other.

### 🟡 D. Sales global discount is excluded from `invoice.total`, and recap reads it raw — ✅ FIXED
`services/invoiceCalculationService.js:79` computes `total = subTotal + taxTotal` (the global
discount is computed but **not** subtracted). The system's convention is that net due =
`total - discount` (used in `invoiceController/create.js` and `invoiceService.updateInvoicePayment`).
`recapService.getSalesData` summed raw `invoice.total`, so recap sales were overstated by the
global discount amount.
- **Fixed**: `recapService.getSalesData` now uses net `total - discount` per invoice (sales side
  only — purchase totals are already net). The gross-`total` convention was left unchanged to avoid
  touching the payment-due math + FE display; revisit as part of bug G if a fuller cleanup is wanted.

### 🟡 E. Converted quote→invoice is invisible to recap — ✅ FIXED
`quoteService.convertQuoteToInvoice` never set the new invoice's `status`, so it defaulted to
`'draft'`. `recapService` filters `status != 'draft'`, so converted invoices didn't appear in recap
until their status was changed.
- **Fixed**: `convertQuoteToInvoice` now sets `status: 'pending'` on the new invoice (a valid FE
  status value, meaning a real invoice awaiting payment), so it is counted by recap.

### 🟡 F. Status / paymentStatus casing is inconsistent
Quote uses UPPER (`SENT`, `CONVERTED`); invoice/purchase `status` use lower (`draft`, `sent`);
`paymentStatus` mixes (entity default `UNPAID` upper, `quoteService` writes lowercase `unpaid`,
`invoiceService` writes `UNPAID|PAID|PARTIAL`). Frontend equality checks are fragile.
- Fix direction: define a canonical casing per field and normalize on write + read. Audit all
  readers (FE included) before changing.

### 🔵 G. The `discount` field is overloaded
`invoiceController/create.js` sets `invoice.discount` = computed global-discount **amount**, while
`quoteService` sets it to the copied `quote.discount`. Same column, two meanings → payment-due math
differs depending on how the invoice was created.

### 🔵 H. Orphan/dead surface
`InvoiceItem`, `PurchaseItem` entities and `purchaseInvoiceItemController` are unused. The REST
master-data routes (bug C) are dead. Consider removing to reduce confusion.

### 🔵 I. Document numbering is frontend-driven and collision-prone
The client supplies `number`; `last_invoice_number` is incremented separately. Quote→invoice copies
the quote's `number` verbatim. Concurrent creates can collide. Consider server-authoritative,
per-(year) sequence allocation.

---

## 9. What's solid vs fragile
**Solid**: auth/session lifecycle, purchase→stock IN idempotency, recap report structure, generic
CRUD auto-wiring, MySQL legacy-compat bootstrap.
**Fragile**: the sales↔inventory link (missing entirely), product aggregate math, master-data access
control, and discount/total semantics across the different invoice creation paths.

## 10. Suggested fix order (safest first)
1. ~~**D + E** — recap correctness. Low blast radius, no schema change.~~ ✅ DONE
2. **C** — master-data RBAC. Security; choose one code path.
3. **B then A** — stock pair, do together. B needs the opening-balance design decision first.
4. **F, G, I, H** — consistency & cleanup.

Always re-check the impact chain after any change:
**invoice total → payment status → stock quantity → stock-ledger history → recap/profit.**
