const { AppDataSource } = require('@/typeorm-data-source');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const summary = require('./summary');

function modelController() {
  const repository = AppDataSource.getRepository('Client');
  const methods = createCRUDController(repository);

  methods.summary = (req, res) => summary(repository, req, res);
  return methods;
}

module.exports = modelController();
