const { AppDataSource } = require('@/typeorm-data-source');

const repository = AppDataSource.getRepository('StockLedger');

const list = async () => {
  return repository.find();
};

module.exports = { list };
