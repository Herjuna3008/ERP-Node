const { In } = require('typeorm');
const { AppDataSource } = require('@/typeorm-data-source');
const { calculate } = require('@/helpers');
const stockLedgerService = require('./stockLedgerService');

const PurchaseInvoiceRepository = AppDataSource.getRepository('PurchaseInvoice');
const PurchaseInvoiceItemRepository = AppDataSource.getRepository('PurchaseInvoiceItem');

const sanitizeDiscountType = (value) => {
  if (value === 'percent' || value === 'percentage') return 'percent';
  return 'amount';
};

const normalizeItemPayload = (item = {}) => {
  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unitPrice || 0);
  const discountValue = Number(item.discountValue || 0);
  const discountType = sanitizeDiscountType(item.discountType);
  const unitDiscount = discountType === 'percent' ? calculate.multiply(unitPrice, discountValue / 100) : discountValue;
  const netUnitPrice = Math.max(calculate.sub(unitPrice, unitDiscount), 0);
  const total = calculate.multiply(netUnitPrice, quantity);

  const productId = typeof item.product === 'object' ? item.product?.id : item.product;

  return {
    id: item.id,
    product: productId,
    description: item.description,
    quantity,
    unitPrice,
    discountValue,
    discountType,
    total,
    netUnitPrice,
  };
};

const computeTotals = (items = [], taxRate = 0, globalDiscountValue = 0, globalDiscountType = 'amount') => {
  let subTotal = 0;
  let discountedTotal = 0;
  const discountValue = Number(globalDiscountValue || 0);

  items.forEach((item) => {
    subTotal = calculate.add(subTotal, calculate.multiply(item.unitPrice, item.quantity));
    discountedTotal = calculate.add(discountedTotal, item.total);
  });

  const normalizedDiscountType = sanitizeDiscountType(globalDiscountType);
  let globalDiscountAmount = 0;
  if (normalizedDiscountType === 'percent') {
    globalDiscountAmount = calculate.multiply(discountedTotal, discountValue / 100);
  } else {
    globalDiscountAmount = discountValue;
  }
  const discountedAfterGlobal = Math.max(calculate.sub(discountedTotal, globalDiscountAmount), 0);
  const taxTotal = calculate.multiply(discountedAfterGlobal, taxRate / 100);
  const total = calculate.add(discountedAfterGlobal, taxTotal);

  return {
    subTotal,
    taxTotal,
    total,
    globalDiscountAmount,
  };
};

const loadInvoice = async (id) => {
  return PurchaseInvoiceRepository.findOne({
    where: { id, removed: false },
    relations: ['items', 'items.product', 'supplier'],
  });
};

const persistItems = async (invoice, items = []) => {
  const existingItems = await PurchaseInvoiceItemRepository.find({ where: { invoice: invoice.id, removed: false } });
  const incomingIds = items.filter((item) => item.id).map((item) => item.id);
  const toDelete = existingItems.filter((item) => !incomingIds.includes(item.id));

  if (toDelete.length) {
    await PurchaseInvoiceItemRepository.remove(toDelete);
  }

  const upsertedItems = [];
  for (const item of items) {
    if (item.id) {
      const current = existingItems.find((existing) => existing.id === item.id);
      if (!current) continue;
      PurchaseInvoiceItemRepository.merge(current, {
        product: item.product,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountValue: item.discountValue,
        discountType: item.discountType,
        total: item.total,
      });
      const saved = await PurchaseInvoiceItemRepository.save(current);
      upsertedItems.push({ ...item, id: saved.id });
    } else {
      const created = PurchaseInvoiceItemRepository.create({
        invoice: invoice.id,
        product: item.product,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountValue: item.discountValue,
        discountType: item.discountType,
        total: item.total,
      });
      const saved = await PurchaseInvoiceItemRepository.save(created);
      upsertedItems.push({ ...item, id: saved.id });
    }
  }
  return upsertedItems;
};

const applyStatusTransitionEffects = async (invoice, items, previousStatus) => {
  if (!invoice) return;
  const currentStatus = invoice.status;
  const isSent = currentStatus === 'sent';
  const wasSent = previousStatus === 'sent';

  if (wasSent && !isSent) {
    await stockLedgerService.removeEntriesBySource(stockLedgerService.SOURCE_TYPES.PURCHASE_INVOICE, invoice.id);
  }

  if (!isSent) return;

  if (wasSent) {
    await stockLedgerService.removeEntriesBySource(stockLedgerService.SOURCE_TYPES.PURCHASE_INVOICE, invoice.id);
  }

  for (const item of items) {
    if (!item.product) continue;
    const costPrice = item.netUnitPrice || item.unitPrice;
    await stockLedgerService.recordEntry({
      productId: item.product,
      quantity: item.quantity,
      entryType: stockLedgerService.ENTRY_TYPES.IN,
      costPrice,
      sourceType: stockLedgerService.SOURCE_TYPES.PURCHASE_INVOICE,
      sourceId: invoice.id,
      sourceItemId: item.id,
    });
  }
};

const createPurchaseInvoice = async (payload, adminId) => {
  const normalizedItems = (payload.items || []).map(normalizeItemPayload);
  const { subTotal, taxTotal, total } = computeTotals(
    normalizedItems,
    payload.taxRate,
    payload.globalDiscountValue,
    payload.globalDiscountType
  );

  const invoiceEntity = PurchaseInvoiceRepository.create({
    ...payload,
    createdBy: adminId,
    subTotal,
    taxTotal,
    total,
    status: payload.status || 'draft',
    globalDiscountType: sanitizeDiscountType(payload.globalDiscountType),
  });
  const savedInvoice = await PurchaseInvoiceRepository.save(invoiceEntity);
  const items = await persistItems(savedInvoice, normalizedItems);
  savedInvoice.items = items;
  await applyStatusTransitionEffects(savedInvoice, items, null);
  return loadInvoice(savedInvoice.id);
};

const updatePurchaseInvoice = async (id, payload) => {
  const invoice = await loadInvoice(id);
  if (!invoice) return null;
  const previousStatus = invoice.status;

  const normalizedItems = (payload.items || []).map(normalizeItemPayload);
  const { subTotal, taxTotal, total } = computeTotals(
    normalizedItems,
    payload.taxRate ?? invoice.taxRate,
    payload.globalDiscountValue ?? invoice.globalDiscountValue,
    payload.globalDiscountType ?? invoice.globalDiscountType
  );

  PurchaseInvoiceRepository.merge(invoice, {
    ...payload,
    subTotal,
    taxTotal,
    total,
    globalDiscountType: sanitizeDiscountType(payload.globalDiscountType ?? invoice.globalDiscountType),
  });
  const savedInvoice = await PurchaseInvoiceRepository.save(invoice);
  const persistedItems = await persistItems(savedInvoice, normalizedItems);
  await applyStatusTransitionEffects(savedInvoice, persistedItems, previousStatus);
  return loadInvoice(id);
};

const deletePurchaseInvoice = async (id) => {
  const invoice = await loadInvoice(id);
  if (!invoice) return null;
  invoice.removed = true;
  await PurchaseInvoiceRepository.save(invoice);
  await stockLedgerService.removeEntriesBySource(stockLedgerService.SOURCE_TYPES.PURCHASE_INVOICE, invoice.id);
  return invoice;
};

const listPurchaseInvoices = async (params = {}) => {
  const { skip, take, status, supplier } = params;
  const where = { removed: false };
  if (status) where.status = status;
  if (supplier) where.supplier = supplier;

  const takeValue = Number.isFinite(Number(take)) && Number(take) > 0 ? Number(take) : 25;
  const skipValue = Number.isFinite(Number(skip)) && Number(skip) >= 0 ? Number(skip) : 0;

  const [result, total] = await PurchaseInvoiceRepository.findAndCount({
    where,
    relations: ['items', 'items.product', 'supplier'],
    order: { created: 'DESC' },
    skip: skipValue,
    take: takeValue,
  });

  return { result, total };
};

const getStockToBuy = async () => {
  const invoices = await PurchaseInvoiceRepository.find({
    where: { removed: false, status: In(['sent', 'confirmed']) },
    relations: ['items', 'items.product'],
  });

  const grouped = new Map();
  invoices.forEach((invoice) => {
    (invoice.items || []).forEach((item) => {
      if (!item.product) return;
      const productId = item.product.id || item.product;
      if (!grouped.has(productId)) {
        grouped.set(productId, {
          productId,
          productName: item.product.name || '',
          quantity: 0,
          lastCostPrice: 0,
        });
      }
      const entry = grouped.get(productId);
      entry.quantity = calculate.add(entry.quantity, item.quantity);
    });
  });

  const productIds = Array.from(grouped.keys());
  if (productIds.length) {
    const lastPrices = await stockLedgerService.getLastPricesForProducts(productIds);
    productIds.forEach((productId) => {
      const entry = grouped.get(productId);
      const prices = lastPrices[productId] || {};
      entry.lastCostPrice = prices.costPrice || 0;
      entry.lastSellPrice = prices.sellPrice || 0;
    });
  }

  return Array.from(grouped.values());
};

module.exports = {
  loadInvoice,
  createPurchaseInvoice,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
  listPurchaseInvoices,
  getStockToBuy,
};
