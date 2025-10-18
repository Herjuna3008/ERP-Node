const { calculate } = require('@/helpers');

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};

const normalizeDiscountType = (value) => {
  if (!value) return 'NONE';
  const normalized = value.toString().toUpperCase();
  if (['PERCENTAGE', 'FIXED', 'NONE'].includes(normalized)) {
    return normalized;
  }
  return 'NONE';
};

const normalizeInvoiceItem = (item = {}) => {
  const quantity = Math.max(normalizeNumber(item.quantity, 0), 0);
  const price = Math.max(normalizeNumber(item.price, 0), 0);
  const discountType = normalizeDiscountType(item.discountType);
  let discountValue = Math.max(normalizeNumber(item.discountValue, 0), 0);

  const baseTotal = calculate.multiply(price, quantity);
  let discountAmount = 0;

  if (discountType === 'PERCENTAGE') {
    discountAmount = calculate.multiply(baseTotal, discountValue / 100);
  } else if (discountType === 'FIXED') {
    discountAmount = discountValue;
  }

  if (discountAmount > baseTotal) {
    discountAmount = baseTotal;
  }

  const total = baseTotal > discountAmount ? calculate.sub(baseTotal, discountAmount) : 0;

  return {
    ...item,
    quantity,
    price,
    discountType,
    discountValue: discountType === 'NONE' ? 0 : discountValue,
    total,
  };
};

const computeTotals = ({
  items = [],
  globalDiscountType = 'NONE',
  globalDiscountValue = 0,
  taxRate = 0,
} = {}) => {
  const normalizedItems = items.map((item) => normalizeInvoiceItem(item));

  let subTotal = 0;
  normalizedItems.forEach((item) => {
    subTotal = calculate.add(subTotal, Number(item.total || 0));
  });

  const normalizedGlobalDiscountType = normalizeDiscountType(globalDiscountType);
  let normalizedGlobalDiscountValue = Math.max(normalizeNumber(globalDiscountValue, 0), 0);

  let discountAmount = 0;
  if (normalizedGlobalDiscountType === 'PERCENTAGE') {
    discountAmount = calculate.multiply(subTotal, normalizedGlobalDiscountValue / 100);
  } else if (normalizedGlobalDiscountType === 'FIXED') {
    discountAmount = normalizedGlobalDiscountValue;
  }

  if (discountAmount > subTotal) {
    discountAmount = subTotal;
  }

  const taxRateValue = Math.max(normalizeNumber(taxRate, 0), 0);
  const taxableAmount = Math.max(calculate.sub(subTotal, discountAmount), 0);
  const taxTotal = calculate.multiply(taxableAmount, taxRateValue / 100);
  const total = calculate.add(subTotal, taxTotal);

  if (normalizedGlobalDiscountType === 'NONE') {
    normalizedGlobalDiscountValue = 0;
  }

  return {
    items: normalizedItems,
    subTotal,
    discountAmount,
    taxTotal,
    total,
    globalDiscountType: normalizedGlobalDiscountType,
    globalDiscountValue: normalizedGlobalDiscountValue,
    taxRate: taxRateValue,
  };
};

module.exports = {
  normalizeInvoiceItem,
  computeTotals,
  normalizeDiscountType,
};
