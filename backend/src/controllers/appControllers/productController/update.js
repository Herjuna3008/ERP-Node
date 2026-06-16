const { AppDataSource } = require('@/typeorm-data-source');
const stockLedgerService = require('@/services/stockLedgerService');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');

const Product = AppDataSource.getRepository('Product');

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? fallback : numeric;
};

const update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await Product.findOne({ where: { id, removed: false } });
  if (!existing) {
    return res.status(404).json({ success: false, result: null, message: 'No document found ' });
  }

  const body = { ...req.body };
  const hasStockField =
    body.stockQuantity !== undefined && body.stockQuantity !== null && body.stockQuantity !== '';
  const targetQty = toNumber(body.stockQuantity);
  const adjustmentCost = toNumber(body.lastCostPrice);

  // Never overwrite ledger-derived aggregates directly; a stock change becomes a
  // delta adjustment entry below so the ledger stays authoritative.
  delete body.stockQuantity;
  delete body.lastCostPrice;
  delete body.lastSellPrice;

  Product.merge(existing, body);
  await Product.save(existing);

  if (hasStockField) {
    const currentQty = toNumber(existing.stockQuantity); // ledger-derived value before adjustment
    const delta = targetQty - currentQty;
    if (delta !== 0) {
      await stockLedgerService.recordEntry({
        productId: id,
        quantity: Math.abs(delta),
        entryType: delta > 0 ? stockLedgerService.ENTRY_TYPES.IN : stockLedgerService.ENTRY_TYPES.OUT,
        costPrice: delta > 0 ? adjustmentCost : 0,
        sourceType: stockLedgerService.SOURCE_TYPES.ADJUSTMENT,
        sourceId: id,
        notes: 'Stock adjustment from product edit',
      });
    }
  }

  const result = await Product.findOne({ where: { id } });
  return res.status(200).json({
    success: true,
    result: addId(result),
    message: 'we update this document ',
  });
};

module.exports = update;
