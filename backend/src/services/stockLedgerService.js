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

const recalculateProductAggregates = async (productId) => {
  if (!productId) return null;
  const product = await ProductRepository.findOne({ where: { id: productId, removed: false } });
  if (!product) return null;

  const entries = await StockLedgerRepository.find({ where: { product: productId } });
  let stockQuantity = 0;
  let lastCostPrice = product.lastCostPrice || 0;
  let lastSellPrice = product.lastSellPrice || 0;

  entries.forEach((entry) => {
    if (entry.entryType === ENTRY_TYPES.IN) {
      stockQuantity += entry.quantity;
      lastCostPrice = entry.costPrice || lastCostPrice;
    } else if (entry.entryType === ENTRY_TYPES.OUT) {
      stockQuantity -= entry.quantity;
      lastSellPrice = entry.sellPrice || lastSellPrice;
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
  if (!productId || !quantity || !entryType || !sourceType || !sourceId) {
    throw new Error('Invalid stock ledger payload');
  }

  const entry = StockLedgerRepository.create({
    product: productId,
    quantity,
    entryType,
    costPrice,
    sellPrice,
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
