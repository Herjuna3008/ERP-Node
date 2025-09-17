const { AppDataSource } = require('@/typeorm-data-source');
const { increaseStock, decreaseStock } = require('@/utils/stock');

const purchaseRepository = AppDataSource.getRepository('Purchase');
const itemRepository = AppDataSource.getRepository('PurchaseItem');

const list = async () => {
  return purchaseRepository.find();
};

const get = async (id) => {
  const purchase = await purchaseRepository.findOne({ where: { id } });
  if (!purchase) return null;
  const items = await itemRepository.find({ where: { purchase: id } });
  return { ...purchase, items };
};

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

const update = async (id, data) => {
  const purchase = await purchaseRepository.findOne({ where: { id } });
  if (!purchase) return null;

  const existingItems = await itemRepository.find({ where: { purchase: id } });
  for (const item of existingItems) {
    await decreaseStock({
      productId: item.product,
      quantity: item.quantity,
      refId: id,
      type: 'PURCHASE',
    });
  }
  await itemRepository.delete({ purchase: id });

  const { supplier, date, items = [], notes } = data;
  const total = items.reduce((sum, i) => sum + i.quantity * i.cost, 0);
  const merged = purchaseRepository.merge(purchase, {
    supplier,
    date,
    total,
    notes,
  });
  await purchaseRepository.save(merged);

  for (const item of items) {
    const entity = itemRepository.create({
      purchase: id,
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
      refId: id,
      type: 'PURCHASE',
    });
  }

  return merged;
};

const remove = async (id) => {
  const purchase = await purchaseRepository.findOne({ where: { id } });
  if (!purchase) return null;

  const items = await itemRepository.find({ where: { purchase: id } });
  for (const item of items) {
    await decreaseStock({
      productId: item.product,
      quantity: item.quantity,
      refId: id,
      type: 'PURCHASE',
    });
  }

  await itemRepository.delete({ purchase: id });
  await purchaseRepository.delete(id);
  return purchase;
};

module.exports = { list, get, create, update, remove };
