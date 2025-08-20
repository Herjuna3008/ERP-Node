const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');
const repository = AppDataSource.getRepository('Quote');
const methods = createCRUDController(repository);

const sendMail = require('./sendMail');
const create = require('./create');
const summary = require('./summary');
const update = require('./update');
const convertQuoteToInvoice = require('./convertQuoteToInvoice');
const paginatedList = require('./paginatedList');
const read = require('./read');

methods.list = paginatedList;
methods.read = read;

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.convert = convertQuoteToInvoice;
methods.summary = summary;

module.exports = methods;
