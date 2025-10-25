import { request } from '@/request';

const entityName = 'purchaseinvoice/stock-to-buy';

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'object') {
    return Array.isArray(value) ? value : Object.values(value);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const fetchInvoicesWithStatus = async (status = 'stock_to_buy') => {
  const invoices = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await request.list({
      entity: 'invoice',
      options: { filter: 'status', equal: status, page, items: 50 },
    });

    if (!response?.success) {
      break;
    }

    const results = Array.isArray(response.result) ? response.result : [];
    invoices.push(...results);

    const totalPages = Number(response?.pagination?.pages || 1);
    if (!totalPages || page >= totalPages) {
      hasMore = false;
    } else {
      page += 1;
    }
  }

  return invoices;
};

const extractInvoiceEntries = (invoices = []) => {
  const entries = [];
  invoices.forEach((invoice) => {
    const items = ensureArray(invoice.items);
    items.forEach((item) => {
      const product = item?.product;
      const productId =
        item?.productId ?? (product && (product.id ?? product)) ?? null;
      const productName =
        item?.itemName ?? item?.productName ?? product?.name ?? item?.description ?? '';

      entries.push({
        productId,
        productName,
        quantity: toNumber(item?.quantity),
        lastSellPrice: toNumber(item?.price),
        lastCostPrice: toNumber(item?.costPrice),
        currency: invoice?.currency,
      });
    });
  });
  return entries;
};

const normalizePurchaseEntries = (records = []) =>
  records.map((entry) => ({
    productId: entry?.productId ?? entry?.product?.id ?? entry?.product,
    productName: entry?.productName ?? entry?.product?.name ?? '',
    quantity: toNumber(entry?.quantity),
    lastCostPrice: toNumber(entry?.lastCostPrice),
    lastSellPrice: toNumber(entry?.lastSellPrice),
    currency: entry?.currency,
  }));

const mergeEntries = (entries = []) => {
  const grouped = new Map();
  let fallbackCounter = 0;

  entries.forEach((entry) => {
    if (!entry) return;
    const normalizedName = entry.productName?.trim();
    const nameKey = normalizedName ? normalizedName.toLowerCase() : `unknown-${fallbackCounter}`;
    const key = entry.productId != null && entry.productId !== '' ? `id-${entry.productId}` : `name-${nameKey}`;

    if (!grouped.has(key)) {
      if (!normalizedName) {
        fallbackCounter += 1;
      }
      grouped.set(key, {
        productId: entry.productId != null && entry.productId !== '' ? entry.productId : key,
        productName: normalizedName || 'Unknown Product',
        quantity: toNumber(entry.quantity),
        lastCostPrice: toNumber(entry.lastCostPrice),
        lastSellPrice: toNumber(entry.lastSellPrice),
        currency: entry.currency,
      });
      return;
    }

    const current = grouped.get(key);
    current.quantity = toNumber(current.quantity) + toNumber(entry.quantity);
    if (toNumber(entry.lastCostPrice)) {
      current.lastCostPrice = toNumber(entry.lastCostPrice);
    }
    if (toNumber(entry.lastSellPrice)) {
      current.lastSellPrice = toNumber(entry.lastSellPrice);
    }
    if (!current.currency && entry.currency) {
      current.currency = entry.currency;
    }
    if (current.productName === 'Unknown Product' && normalizedName) {
      current.productName = normalizedName;
    }
    if ((current.productId === key || current.productId == null) && entry.productId) {
      current.productId = entry.productId;
    }
  });

  return Array.from(grouped.values());
};

const stockToBuyService = {
  entity: entityName,
  list: async ({ options = {} } = {}) => {
    const page = Number(options.page) || 1;
    const pageSize = Number(options.items) || 10;

    const [purchaseResponse, invoiceData] = await Promise.all([
      request.get({ entity: entityName }),
      fetchInvoicesWithStatus('stock_to_buy'),
    ]);

    const purchaseEntries = purchaseResponse?.success
      ? normalizePurchaseEntries(Array.isArray(purchaseResponse.result) ? purchaseResponse.result : [])
      : [];
    const invoiceEntries = extractInvoiceEntries(invoiceData);

    let combined = mergeEntries([...purchaseEntries, ...invoiceEntries]);

    combined.sort((a, b) => a.productName.localeCompare(b.productName));

    if (options.filter === 'product' && options.equal != null) {
      combined = combined.filter((item) => String(item.productId) === String(options.equal));
    }

    const start = (page - 1) * pageSize;
    const paginated = combined.slice(start, start + pageSize);

    return {
      success: true,
      result: paginated,
      pagination: {
        page,
        count: combined.length,
      },
    };
  },
};

export default stockToBuyService;
