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
5. Stock OUT is written when the invoice is committed (non-draft), via
   `invoiceStockService.syncInvoiceStock` (was bug A, now fixed).

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
- `recalculateProductAggregates()` recomputes `stockQuantity / lastCostPrice / lastSellPrice` by
  replaying the full ledger from zero (idempotent; was bug B, now fixed).
- Manual adjustments go through `stockLedgerController` (source type `adjustment`). The custom
  `productController` also emits `adjustment` entries for stock typed into the product form
  (opening balance on create, signed delta on edit) so `stockQuantity` stays fully ledger-derived.

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

### 🔴 A. Sales invoices never decrement stock — ✅ FIXED
`ENTRY_TYPES.OUT` and `SOURCE_TYPES.SALES_INVOICE` were defined but had **zero callers** (only
purchases wrote `IN`, plus manual adjustments). Selling goods did not reduce `stockQuantity`.
- **Fixed**: new `services/invoiceStockService.syncInvoiceStock(invoice)` writes `OUT` ledger
  entries per line item when an invoice is **committed (any non-draft status — `pending`/`sent`)**,
  and clears them otherwise. It is idempotent (remove-by-source, then re-add) and wired into
  `invoiceController` create/update/remove and `quoteService` conversion. Trigger status = non-draft
  (consistent with recap). Overselling is **allowed** (stock can go negative) — blocking is a
  separate policy decision.
- Limitation: only items with a `productId` move stock. Manual invoices always have one (the item
  product picker is required), but quote line items carry no product link, so **converted invoices
  do not decrement stock until edited** through the invoice form.

### 🔴 B. `recalculateProductAggregates` double-counts stock — ✅ FIXED
`services/stockLedgerService.js` initialized `stockQuantity = product.stockQuantity` (the already
stored aggregate) and then added the **entire** ledger on top. Not idempotent: the 2nd ledger entry
for a product already over-counted.
- **Fixed**: `recalculateProductAggregates` now starts the running total at `0` and replays the full
  ledger (ordered ascending so `lastCost`/`lastSell` reflect the newest entry). The stock ledger is
  the single source of truth.
- **Design decision taken** (`stockQuantity` was dual-role: form input + derived aggregate): chose
  *fully derived, no schema change*. A new custom `productController` (create/update) converts a
  stock value typed in the product form into an `adjustment` ledger entry (opening stock on create;
  a signed delta on edit), instead of writing the column directly. So the column is always derived
  and the form UX is preserved.

### 🔴 C. Master-data RBAC is bypassed — ✅ FIXED
RBAC (`owner`/`manager`) was only applied on the **REST** routes `/api/products`, `/api/suppliers`
(`routes/masterDataRoutes.js`). But the frontend and `appApi.js` use the **action-suffix** path
`/api/product/*`, `/api/supplier/*`, generated as **generic CRUD with no RBAC**, so any authenticated
admin (any role) could CRUD products/suppliers. Two parallel product/supplier code paths also existed
(generic CRUD vs the dead `masterData/*Service`). The dead route's whitelist `['owner','manager']`
also wrongly excluded the `admin` (super_admin) role.
- **Fixed**: `appApi.js` now guards `product`/`supplier` **create/update/delete** with
  `rbac(['owner','admin','manager'])` (the path the FE actually uses). **Reads stay open** so the
  invoice/quote item pickers work for every role (incl. `employee`/`read_only`). The dead REST path
  was removed entirely: `routes/masterDataRoutes.js`, `controllers/masterData/*`,
  `services/masterData/*`, and its mount in `app.js`. One code path now, RBAC enforced.

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

### 🟡 F. Status / paymentStatus casing is inconsistent — ✅ FIXED
`invoice.paymentStatus` was written in three different forms: `create.js` wrote `PAID`/`UNPAID`,
`invoiceService.updateInvoicePayment` (the `/invoices/:id/payments` path) wrote `PAID|PARTIAL|UNPAID`,
while `update.js`, `paymentController/*` and `quoteService` already wrote lowercase
`paid|partially|unpaid`. The two payment-recording paths therefore disagreed, and the entity default
was `UNPAID`. Readers expect **lowercase**: BE `invoiceController/summary.js` and the i18n keys, FE
`utils/statusTagColor`.
- **Fixed**: canonical `paymentStatus` casing is **lowercase `unpaid | paid | partially`**.
  Normalized the three uppercase writers — `Invoice` entity default, `invoiceController/create.js`,
  and `invoiceService.updateInvoicePayment` (also `PARTIAL` → `partially`). `summary.js` now compares
  case-insensitively so legacy rows still count; FE `tagColor()` was already case-insensitive.
- Out of scope: `quote.status` stays UPPER (`DRAFT|SENT|CONVERTED`) — it is a self-consistent enum;
  `invoice`/`purchaseInvoice` `status` were already lowercase-consistent. Pre-existing DB rows with
  uppercase `paymentStatus` are legacy data (no migration framework) — tags render fine via the
  case-insensitive lookup; only raw-text displays of old rows stay uppercase.

### 🔵 G. The `discount` field is overloaded — ✅ FIXED
`invoiceController/create.js`/`update.js` set `invoice.discount` = the computed global-discount
**amount** (from `globalDiscountType`/`globalDiscountValue`), while `quoteService` copied the unused
`quote.discount` (quotes have no discount UI/field, so it is always 0) without setting the global
fields. Two write paths, two meanings for the same column.
- **Fixed**: `invoice.discount` is now canonically *the global-discount amount derived from
  `globalDiscountType`/`globalDiscountValue`*. Quote→invoice conversion no longer copies
  `quote.discount`; it sets `discount: 0` + `globalDiscountType: 'NONE'` + `globalDiscountValue: 0`
  explicitly, so the converted invoice's discount is consistent and survives later edits. Documented
  the convention on the `Invoice` entity. Zero behavioural change today (quote.discount was always 0).
- Still by design (not part of G): `total` stays GROSS and net payable = `total - discount` (the
  fuller "make `total` net" refactor was deliberately deferred — see bug D).

### 🔵 H. Orphan/dead surface
`InvoiceItem`, `PurchaseItem` entities and `purchaseInvoiceItemController` are unused. Consider
removing to reduce confusion. (The dead REST master-data routes were already removed as part of
bug **C**.)

### 🔵 I. Document numbering is frontend-driven and collision-prone
The client supplies `number`; `last_invoice_number` is incremented separately. Quote→invoice copies
the quote's `number` verbatim. Concurrent creates can collide. Consider server-authoritative,
per-(year) sequence allocation.

### 🔴 J. MySQL `DATE` columns reject the frontend's ISO datetime strings — ✅ FIXED
Saving an invoice failed with `Incorrect datetime value: '2026-06-18T03:28:18.047Z' for column
'date'`. The dayjs date pickers serialize to a full ISO-8601 timestamp (date + time + `Z`), but
`invoices.date` / `expiredDate` (and `quotes`, `payments`, `purchase_invoices`, `expenses` date
columns) are MySQL `DATE` (date-only). The controllers persisted `req.body` verbatim, so MySQL (strict
mode) rejected the format. Affected every `type: 'date'` column on any FE-driven create/update.
- **Fixed centrally**: `typeorm-data-source.js` now attaches a write transformer to **every**
  `type: 'date'` column (`normalizeDateOnlyColumns`) that coerces any incoming value (ISO string /
  `Date` / `YYYY-MM-DD…`) to a plain `YYYY-MM-DD` before it reaches MySQL. One fix covers all entities
  and all write paths; no controller changes. Verified end-to-end: a create with
  `'2026-06-18T03:28:18.047Z'` now returns 200 and stores `2026-06-18`.

---

## 9. What's solid vs fragile
**Solid**: auth/session lifecycle, purchase→stock IN idempotency, sales→stock OUT (bug A) and the
ledger-derived product aggregates (bug B), master-data access control (bug C), recap correctness
(bugs D/E), generic CRUD auto-wiring, MySQL legacy-compat bootstrap.
**Fragile / still open**: discount/total semantics across invoice creation paths (bug G), status
casing (bug F), document numbering (bug I), and converted invoices not decrementing stock until
edited (quote items have no product link).

## 10. Suggested fix order (safest first)
1. ~~**D + E** — recap correctness. Low blast radius, no schema change.~~ ✅ DONE
2. ~~**C** — master-data RBAC. Security; choose one code path.~~ ✅ DONE
3. ~~**B then A** — stock pair, do together. B needs the opening-balance design decision first.~~ ✅ DONE
4. ~~**F** — paymentStatus casing.~~ ✅ DONE
5. ~~**G** — `discount` overload.~~ ✅ DONE
6. **H, I** — cleanup (orphan entities) & server-side numbering. *(still open)*

Always re-check the impact chain after any change:
**invoice total → payment status → stock quantity → stock-ledger history → recap/profit.**
