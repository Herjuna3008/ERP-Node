const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');
const repository = AppDataSource.getRepository('Payment');
const methods = createCRUDController(repository);

const create = require('./create');
const summary = require('./summary');
const update = require('./update');
const remove = require('./remove');
const sendMail = require('./sendMail');
const paginatedList = require('./paginatedList');

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.delete = remove;
methods.summary = summary;
methods.list = (req, res) => paginatedList(req, res);

module.exports = methods;
