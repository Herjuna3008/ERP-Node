const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');

const repository = AppDataSource.getRepository('ExpenseCategory');

module.exports = createCRUDController(repository);
