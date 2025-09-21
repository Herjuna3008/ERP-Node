const { AppDataSource } = require('@/typeorm-data-source');

const ExpenseCategoryRepository = AppDataSource.getRepository('ExpenseCategory');

const list = async () => {
  return ExpenseCategoryRepository.find({ where: { removed: false }, order: { name: 'ASC' } });
};

const get = async (id) => {
  return ExpenseCategoryRepository.findOne({ where: { id, removed: false } });
};

const create = async (data) => {
  const entity = ExpenseCategoryRepository.create(data);
  return ExpenseCategoryRepository.save(entity);
};

const update = async (id, data) => {
  const category = await get(id);
  if (!category) return null;
  ExpenseCategoryRepository.merge(category, data);
  return ExpenseCategoryRepository.save(category);
};

const remove = async (id) => {
  const category = await get(id);
  if (!category) return null;
  category.removed = true;
  return ExpenseCategoryRepository.save(category);
};

module.exports = { list, get, create, update, remove };
