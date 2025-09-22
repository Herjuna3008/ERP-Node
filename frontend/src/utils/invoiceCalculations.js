import calculate from './calculate';

const normalizeDiscountType = (type) => (type ? type.toString().toUpperCase() : 'NONE');

export const computeItemTotals = (item = {}) => {
  const quantity = Number(item.quantity ?? 0) < 0 ? 0 : Number(item.quantity ?? 0) || 0;
  const price = Number(item.price ?? 0) < 0 ? 0 : Number(item.price ?? 0) || 0;
  const discountType = normalizeDiscountType(item.discountType);
  let discountValue = Number(item.discountValue ?? 0) || 0;
  if (discountValue < 0) discountValue = 0;

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
    quantity,
    price,
    discountType,
    discountValue: discountType === 'NONE' ? 0 : discountValue,
    baseTotal,
    discountAmount,
    total,
  };
};

export const computeGlobalDiscountAmount = (subTotal = 0, type = 'NONE', value = 0) => {
  const normalizedType = normalizeDiscountType(type);
  let discountValue = Number(value ?? 0) || 0;
  if (discountValue < 0) discountValue = 0;

  let discountAmount = 0;
  if (normalizedType === 'PERCENTAGE') {
    discountAmount = calculate.multiply(subTotal, discountValue / 100);
  } else if (normalizedType === 'FIXED') {
    discountAmount = discountValue;
  }

  if (discountAmount > subTotal) {
    discountAmount = subTotal;
  }

  return discountAmount;
};

export const computeInvoiceTotals = ({
  items = [],
  globalDiscountType = 'NONE',
  globalDiscountValue = 0,
  taxRate = 0,
}) => {
  let subTotal = 0;

  const normalizedItems = items.map((item) => {
    const calculated = computeItemTotals(item);
    subTotal = calculate.add(subTotal, calculated.total);
    return {
      ...item,
      quantity: calculated.quantity,
      price: calculated.price,
      discountType: calculated.discountType,
      discountValue: calculated.discountType === 'NONE' ? 0 : calculated.discountValue,
      total: calculated.total,
    };
  });

  const discountAmount = computeGlobalDiscountAmount(subTotal, globalDiscountType, globalDiscountValue);
  const netSubtotal = subTotal > discountAmount ? calculate.sub(subTotal, discountAmount) : 0;
  const taxTotal = taxRate ? calculate.multiply(netSubtotal, taxRate) : 0;
  const total = calculate.add(netSubtotal, taxTotal);

  return {
    items: normalizedItems,
    subTotal,
    discountAmount,
    netSubtotal,
    taxTotal,
    total,
  };
};

