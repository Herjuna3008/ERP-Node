const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');
const purchaseInvoiceService = require('@/services/purchaseInvoiceService');

const repository = AppDataSource.getRepository('PurchaseInvoice');
const methods = createCRUDController(repository);

const create = require('./create');
const update = require('./update');
const remove = require('./remove');
const read = require('./read');
const list = require('./list');

methods.create = create;
methods.update = update;
methods.delete = remove;
methods.read = read;
methods.list = list;
methods.listAll = list;
methods.filter = list;
methods.search = list;

methods.stockToBuy = async (req, res) => {
  const data = await purchaseInvoiceService.getStockToBuy();
  return res.status(200).json({ success: true, result: data, message: 'Stock to buy generated' });
};

module.exports = methods;
