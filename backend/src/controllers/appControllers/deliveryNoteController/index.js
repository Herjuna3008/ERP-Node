const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');
const repository = AppDataSource.getRepository('DeliveryNote');
const methods = createCRUDController(repository);

const create = require('./create');
const post = require('./post');
const generateInvoice = require('./generateInvoice');

methods.create = create;
methods.post = post;
methods.generateInvoice = generateInvoice;

module.exports = methods;
