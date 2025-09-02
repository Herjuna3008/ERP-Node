const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');
const repository = AppDataSource.getRepository('DeliveryNote');
const methods = createCRUDController(repository);

const create = require('./create');
const post = require('./post');
const generateInvoice = require('./generateInvoice');
const download = require('./download');
const read = require('./read');
const update = require('./update');
const paginatedList = require('./paginatedList');

methods.create = create;
methods.post = post;
methods.generateInvoice = generateInvoice;
methods.download = download;
methods.read = read;
methods.update = update;
methods.list = paginatedList;

module.exports = methods;
