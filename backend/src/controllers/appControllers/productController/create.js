const { AppDataSource } = require('@/typeorm-data-source');
const stockLedgerService = require('@/services/stockLedgerService');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');

const Product = AppDataSource.getRepository('Product');

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? fallback : numeric;
};

const create = async (req, res) => {
  const body = { ...req.body };

  // Capture the typed opening stock, then strip the derived aggregates so they are
  // never trusted from the client — the ledger (and recalc) are the source of truth.
  const openingQty = toNumber(body.stockQuantity);
  const openingCost = toNumber(body.lastCostPrice);
  body.removed = false;
  body.stockQuantity = 0;
  body.lastCostPrice = 0;
  body.lastSellPrice = 0;

  const product = await Product.save(Product.create(body));

  if (openingQty > 0) {
    await stockLedgerService.recordEntry({
      productId: product.id,
      quantity: openingQty,
      entryType: stockLedgerService.ENTRY_TYPES.IN,
      costPrice: openingCost,
      sourceType: stockLedgerService.SOURCE_TYPES.ADJUSTMENT,
      sourceId: product.id,
      notes: 'Opening stock',
    });
  }

  const result = await Product.findOne({ where: { id: product.id } });
  return res.status(200).json({
    success: true,
    result: addId(result),
    message: 'Successfully Created the document in Model ',
  });
};

module.exports = create;
