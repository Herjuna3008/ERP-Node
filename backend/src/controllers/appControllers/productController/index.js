const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');

const repository = AppDataSource.getRepository('Product');
const methods = createCRUDController(repository);

// Product stock aggregates (stockQuantity / lastCostPrice / lastSellPrice) are derived
// from the stock ledger. Override create/update so a stock value typed in the product
// form becomes an adjustment ledger entry instead of being written to the column
// directly (which the recalc would otherwise overwrite). read/list/delete stay generic.
methods.create = require('./create');
methods.update = require('./update');

module.exports = methods;
