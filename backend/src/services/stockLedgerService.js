const { In } = require('typeorm');
const { AppDataSource } = require('@/typeorm-data-source');

const ProductRepository = AppDataSource.getRepository('Product');
const StockLedgerRepository = AppDataSource.getRepository('StockLedger');

const ENTRY_TYPES = {
  IN: 'IN',
  OUT: 'OUT',
};

const SOURCE_TYPES = {
  PURCHASE_INVOICE: 'purchase_invoice',
  SALES_INVOICE: 'sales_invoice',
  ADJUSTMENT: 'adjustment',
};

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? fallback : numeric;
};

const recalculateProductAggregates = async (productId) => {
  if (!productId) return null;
  const product = await ProductRepository.findOne({ where: { id: productId, removed: false } });
  if (!product) return null;

  // The stock ledger is the single source of truth. Replay the whole history from
  // zero so this is idempotent. (Previously it started from the already-stored
  // product.stockQuantity and re-added the entire ledger on every call -> double
  // counting.) Order ascending so lastCost/lastSell reflect the newest entry.
  const entries = await StockLedgerRepository.find({
    where: { product: productId },
    order: { created: 'ASC', id: 'ASC' },
  });
  let stockQuantity = 0;
  let lastCostPrice = toNumber(product.lastCostPrice);
  let lastSellPrice = toNumber(product.lastSellPrice);

  entries.forEach((entry) => {
    if (entry.entryType === ENTRY_TYPES.IN) {
      stockQuantity += toNumber(entry.quantity);
      lastCostPrice = toNumber(entry.costPrice, lastCostPrice);
    } else if (entry.entryType === ENTRY_TYPES.OUT) {
      stockQuantity -= toNumber(entry.quantity);
      lastSellPrice = toNumber(entry.sellPrice, lastSellPrice);
    }
  });

  product.stockQuantity = stockQuantity;
  product.lastCostPrice = lastCostPrice;
  product.lastSellPrice = lastSellPrice;
  return ProductRepository.save(product);
};

const listEntries = async (filters = {}) => {
  const where = {};
  if (filters.product) where.product = filters.product;
  if (filters.sourceType) where.sourceType = filters.sourceType;
  if (filters.entryType) where.entryType = filters.entryType;

  return StockLedgerRepository.find({
    where,
    relations: ['product'],
    order: { created: 'DESC', id: 'DESC' },
  });
};

const getEntry = async (id) => {
  return StockLedgerRepository.findOne({ where: { id }, relations: ['product'] });
};

const normalizeQuantity = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.abs(numeric);
};

const recordEntry = async ({
  productId,
  quantity,
  entryType,
  costPrice = 0,
  sellPrice = 0,
  sourceType,
  sourceId,
  sourceItemId = null,
  notes = null,
}) => {
  const normalizedQuantity = normalizeQuantity(quantity);

  if (!productId || !normalizedQuantity || !entryType || !sourceType || !sourceId) {
    throw new Error('Invalid stock ledger payload');
  }

  const entry = StockLedgerRepository.create({
    product: productId,
    quantity: normalizedQuantity,
    entryType,
    costPrice: toNumber(costPrice, 0),
    sellPrice: toNumber(sellPrice, 0),
    sourceType,
    sourceId,
    sourceItemId,
    notes,
  });
  const saved = await StockLedgerRepository.save(entry);
  await recalculateProductAggregates(productId);
  return getEntry(saved.id);
};

const removeEntriesBySource = async (sourceType, sourceId) => {
  const entries = await StockLedgerRepository.find({ where: { sourceType, sourceId } });
  if (!entries.length) return [];
  const productIds = entries.map((entry) => entry.product && entry.product.id ? entry.product.id : entry.product);
  await StockLedgerRepository.remove(entries);
  const uniqueProductIds = [...new Set(productIds.filter(Boolean))];
  await Promise.all(uniqueProductIds.map((productId) => recalculateProductAggregates(productId)));
  return uniqueProductIds;
};

const removeEntry = async (id) => {
  const entry = await StockLedgerRepository.findOne({ where: { id } });
  if (!entry) return null;
  const productId = entry.product?.id || entry.product;
  await StockLedgerRepository.remove(entry);
  if (productId) {
    await recalculateProductAggregates(productId);
  }
  return entry;
};

const getLastPrice = async (productId, type = ENTRY_TYPES.IN) => {
  const entry = await StockLedgerRepository.findOne({
    where: { product: productId, entryType: type },
    order: { created: 'DESC' },
  });
  if (!entry) return null;
  return type === ENTRY_TYPES.IN ? entry.costPrice : entry.sellPrice;
};

const getLastPricesForProducts = async (productIds = []) => {
  if (!productIds.length) return {};
  const entries = await StockLedgerRepository.find({
    where: {
      product: In(productIds),
    },
    order: { created: 'DESC' },
  });

  const result = {};
  entries.forEach((entry) => {
    const productId = entry.product?.id || entry.product;
    if (!result[productId]) {
      result[productId] = {};
    }
    if (entry.entryType === ENTRY_TYPES.IN && !result[productId].costPrice) {
      result[productId].costPrice = entry.costPrice;
    }
    if (entry.entryType === ENTRY_TYPES.OUT && !result[productId].sellPrice) {
      result[productId].sellPrice = entry.sellPrice;
    }
  });
  return result;
};

module.exports = {
  ENTRY_TYPES,
  SOURCE_TYPES,
  recordEntry,
  removeEntriesBySource,
  removeEntry,
  recalculateProductAggregates,
  getLastPrice,
  getLastPricesForProducts,
  listEntries,
  getEntry,
};
