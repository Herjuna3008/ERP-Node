const { AppDataSource } = require('@/typeorm-data-source');

exports.getData = ({ model }) => {
  const repository = AppDataSource.getRepository(model);
  return repository.find({ where: { removed: false, enabled: true } });
};

exports.getOne = ({ model, id }) => {
  const repository = AppDataSource.getRepository(model);
  return repository.findOne({ where: { id, removed: false } });
};
