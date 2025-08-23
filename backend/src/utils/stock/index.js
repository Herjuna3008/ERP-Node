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

  product.stock = (product.stock || 0) - quantity;
  await productRepository.save(product);

  const ledger = ledgerRepository.create({
    product: productId,
    quantity: -quantity,
    type,
    ref: refId,
  });
  await ledgerRepository.save(ledger);
  return product;
};

module.exports = { increaseStock, calculateAverageCost, decreaseStock };
