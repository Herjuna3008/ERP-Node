const { AppDataSource } = require('@/typeorm-data-source');

const productRepository = AppDataSource.getRepository('Product');
const ledgerRepository = AppDataSource.getRepository('StockLedger');

const calculateAverageCost = (currentQty, currentAvgCost, qty, cost) => {
  const totalQty = currentQty + qty;
  if (totalQty === 0) return 0;
  const totalCost = currentQty * currentAvgCost + qty * cost;
  return totalCost / totalQty;
};

const increaseStock = async ({ productId, quantity, cost, refId, type = 'PURCHASE' }) => {
  const product = await productRepository.findOne({ where: { id: productId } });
  if (!product) return null;

  const avgCost = calculateAverageCost(product.stock || 0, Number(product.averageCost || 0), quantity, cost);
  product.stock = (product.stock || 0) + quantity;
  product.averageCost = avgCost;
  await productRepository.save(product);

  const ledger = ledgerRepository.create({
    product: productId,
    quantity,
    type,
    ref: refId,
    cost,
  });
  await ledgerRepository.save(ledger);
  return product;
};

const decreaseStock = async ({ productId, quantity, refId, type = 'DELIVERY' }) => {
  const product = await productRepository.findOne({ where: { id: productId } });
  if (!product) return null;
  const newStock = (product.stock || 0) - quantity;
  if (newStock < 0) return null;

  product.stock = newStock;
  await productRepository.save(product);

  const ledger = ledgerRepository.create({
    product: productId,
    quantity: -quantity,
    type,
    ref: refId,
    cost: Number(product.averageCost || 0),
  });
  await ledgerRepository.save(ledger);
  return product;
};

const adjustStock = async ({ productId, quantity }) => {
  const product = await productRepository.findOne({ where: { id: productId } });
  if (!product) return null;

  const diff = quantity - (product.stock || 0);
  product.stock = quantity;
  await productRepository.save(product);

  const ledger = ledgerRepository.create({
    product: productId,
    quantity: diff,
    type: 'ADJUSTMENT',
    ref: null,
    cost: 0,
  });
  await ledgerRepository.save(ledger);
  return product;
};
module.exports = { increaseStock, calculateAverageCost, decreaseStock, adjustStock };
