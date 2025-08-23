const { AppDataSource } = require('@/typeorm-data-source');
const { increaseStock } = require('@/utils/stock');

const purchaseRepository = AppDataSource.getRepository('Purchase');
const itemRepository = AppDataSource.getRepository('PurchaseItem');

const create = async (data) => {
  const { supplier, date, items = [], notes } = data;
  const total = items.reduce((sum, i) => sum + i.quantity * i.cost, 0);
  const purchase = await purchaseRepository.save(
    purchaseRepository.create({ supplier, date, total, notes })
  );

  for (const item of items) {
    const entity = itemRepository.create({
      purchase: purchase.id,
      product: item.product,
      quantity: item.quantity,
      cost: item.cost,
      total: item.quantity * item.cost,
    });
    await itemRepository.save(entity);
    await increaseStock({
      productId: item.product,
      quantity: item.quantity,
      cost: item.cost,
      refId: purchase.id,
      type: 'PURCHASE',
    });
  }

  return purchase;
};

module.exports = { create };
