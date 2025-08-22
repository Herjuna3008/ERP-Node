const { AppDataSource } = require('@/typeorm-data-source');

const repository = AppDataSource.getRepository('Supplier');

const list = async () => {
  return repository.find({ where: { removed: false } });
};

const get = async (id) => {
  return repository.findOne({ where: { id, removed: false } });
};

const create = async (data) => {
  const entity = repository.create({ ...data });
  return repository.save(entity);
};

const update = async (id, data) => {
  const entity = await get(id);
  if (!entity) return null;
  const merged = repository.merge(entity, data);
  return repository.save(merged);
};

const remove = async (id) => {
  const entity = await get(id);
  if (!entity) return null;
  entity.removed = true;
  return repository.save(entity);
};

module.exports = { list, get, create, update, remove };
