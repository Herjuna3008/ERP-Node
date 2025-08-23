const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');

const repository = AppDataSource.getRepository('Expense');

module.exports = createCRUDController(repository);
