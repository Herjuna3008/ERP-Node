const { AppDataSource } = require('@/typeorm-data-source');
const { decreaseStock } = require('@/utils/stock');

const noteRepository = AppDataSource.getRepository('DeliveryNote');
const itemRepository = AppDataSource.getRepository('DeliveryItem');
const invoiceRepository = AppDataSource.getRepository('Invoice');

const create = async (data) => {
  const { client, date, items = [], notes } = data;
  const note = await noteRepository.save(
    noteRepository.create({ client, date, status: 'draft', notes })
  );
  for (const item of items) {
    const entity = itemRepository.create({
      deliveryNote: note.id,
      product: item.product,
      quantity: item.quantity,
    });
    await itemRepository.save(entity);
  }
  return note;
};

const post = async (id) => {
  const note = await noteRepository.findOne({ where: { id } });
  if (!note) return null;
  if (note.status === 'POSTED') return note;
  const items = await itemRepository.find({ where: { deliveryNote: id } });
  for (const item of items) {
    await decreaseStock({
      productId: item.product,
      quantity: item.quantity,
      refId: id,
      type: 'DELIVERY',
    });
  }
  note.status = 'POSTED';
  await noteRepository.save(note);
  return note;
};

const generateInvoice = async (id, adminId) => {
  const note = await noteRepository.findOne({ where: { id } });
  if (!note) return { error: 'Delivery note not found' };
  const items = await itemRepository.find({
    where: { deliveryNote: id },
    relations: ['product'],
  });
  const invoiceItems = items.map((i) => {
    const price = Number(i.product?.price || 0);
    return {
      description: i.product?.name,
      quantity: i.quantity,
      price,
      total: price * i.quantity,
    };
  });
  const subTotal = invoiceItems.reduce((s, i) => s + i.total, 0);
  const invoiceData = {
    number: 0,
    year: new Date().getFullYear(),
    date: new Date(),
    expiredDate: new Date(),
    client: note.client,
    items: invoiceItems,
    taxRate: 0,
    subTotal,
    taxTotal: 0,
    total: subTotal,
    currency: 'NA',
    discount: 0,
    createdBy: adminId,
    paymentStatus: 'UNPAID',
    credit: 0,
  };
  const invoice = await invoiceRepository.save(
    invoiceRepository.create(invoiceData)
  );
  return { invoiceId: invoice.id };
};

module.exports = { create, post, generateInvoice };
