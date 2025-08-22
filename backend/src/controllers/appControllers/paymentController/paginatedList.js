const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Payment');
const clientRepository = AppDataSource.getRepository('Client');
const invoiceRepository = AppDataSource.getRepository('Invoice');
const paymentModeRepository = AppDataSource.getRepository('PaymentMode');
const { In } = require('typeorm');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');

const paginatedList = async (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  const { sortBy = 'id', sortValue = -1, filter, equal } = req.query;
  const columns = Model.metadata.columns.map((c) => c.propertyName);
  const orderBy = columns.includes(sortBy) ? sortBy : 'id';

  const where = { removed: false };
  if (filter && equal !== undefined) {
    where[filter] = equal;
  }

  const [result, count] = await Model.findAndCount({
    where,
    skip,
    take: limit,
    order: { [orderBy]: sortValue === -1 ? 'DESC' : 'ASC' },
  });

  const clientIds = [...new Set(result.map((r) => r.client).filter(Boolean))];
  const invoiceIds = [...new Set(result.map((r) => r.invoice).filter(Boolean))];
  const paymentModeIds = [...new Set(result.map((r) => r.paymentMode).filter(Boolean))];

  const [clients, invoices, paymentModes] = await Promise.all([
    clientIds.length ? clientRepository.find({ where: { id: In(clientIds) } }) : [],
    invoiceIds.length ? invoiceRepository.find({ where: { id: In(invoiceIds) } }) : [],
    paymentModeIds.length ? paymentModeRepository.find({ where: { id: In(paymentModeIds) } }) : [],
  ]);

  const clientMap = {};
  addId(clients).forEach((c) => {
    clientMap[c.id] = c;
  });
  const invoiceMap = {};
  addId(invoices).forEach((i) => {
    invoiceMap[i.id] = i;
  });
  const paymentModeMap = {};
  addId(paymentModes).forEach((p) => {
    paymentModeMap[p.id] = p;
  });

  const payments = result.map((payment) => ({
    ...payment,
    client: clientMap[payment.client] || null,
    invoice: invoiceMap[payment.invoice] || null,
    paymentMode: paymentModeMap[payment.paymentMode] || null,
  }));

  const pages = Math.ceil(count / limit);
  const pagination = { page, pages, count };

  if (count > 0) {
    return res.status(200).json({
      success: true,
      result: addId(payments),
      pagination,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: true,
      result: [],
      pagination,
      message: 'Collection is Empty',
    });
  }
};

module.exports = paginatedList;
