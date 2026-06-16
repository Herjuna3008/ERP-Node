const stockLedgerService = require('./stockLedgerService');

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? fallback : numeric;
};

// A sales invoice is "committed" (goods leave stock) on any non-draft status.
// This matches the recap report, which counts non-draft invoices as real sales.
const isCommitted = (status) =>
  typeof status === 'string' && status.trim() !== '' && status.trim().toLowerCase() !== 'draft';

const resolveProductId = (item = {}) => {
  if (item.productId) return item.productId;
  if (item.product && typeof item.product === 'object') return item.product.id;
  return item.product || null;
};

// Sync the stock-ledger OUT entries for a sales invoice to match its current state.
// Idempotent: always clears this invoice's OUT entries first, then re-creates them
// when the invoice is committed (non-draft) and not removed. Safe to call on every
// create / update / delete and on quote->invoice conversion.
//
// Note: only line items carrying a productId move stock. Manually built invoices
// always have one (the item product picker is required), but quote line items have
// no product link, so converted invoices do not decrement stock until edited.
const syncInvoiceStock = async (invoice) => {
  if (!invoice || !invoice.id) return;

  await stockLedgerService.removeEntriesBySource(
    stockLedgerService.SOURCE_TYPES.SALES_INVOICE,
    invoice.id
  );

  if (invoice.removed) return;
  if (!isCommitted(invoice.status)) return;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  for (const item of items) {
    const productId = resolveProductId(item);
    const quantity = toNumber(item.quantity);
    if (!productId || quantity <= 0) continue;
    await stockLedgerService.recordEntry({
      productId,
      quantity,
      entryType: stockLedgerService.ENTRY_TYPES.OUT,
      sellPrice: toNumber(item.price),
      sourceType: stockLedgerService.SOURCE_TYPES.SALES_INVOICE,
      sourceId: invoice.id,
      notes: 'Sales invoice',
    });
  }
};

module.exports = { syncInvoiceStock };
