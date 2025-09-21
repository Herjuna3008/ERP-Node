const { Between } = require('typeorm');
const { AppDataSource } = require('@/typeorm-data-source');

const ExpenseRepository = AppDataSource.getRepository('Expense');

const list = async (filters = {}) => {
  const where = { removed: false };
  if (filters.category) where.category = filters.category;
  if (filters.supplier) where.supplier = filters.supplier;
  if (filters.startDate && filters.endDate) {
    where.expenseDate = Between(filters.startDate, filters.endDate);
  }

  return ExpenseRepository.find({
    where,
    relations: ['category', 'supplier'],
    order: { expenseDate: 'DESC', id: 'DESC' },
  });
};

const get = async (id) => {
  return ExpenseRepository.findOne({ where: { id, removed: false }, relations: ['category', 'supplier'] });
};

const create = async (data) => {
  const payload = { ...data };
  const entity = ExpenseRepository.create(payload);
  return ExpenseRepository.save(entity);
};

const update = async (id, data) => {
  const expense = await get(id);
  if (!expense) return null;
  ExpenseRepository.merge(expense, data);
  return ExpenseRepository.save(expense);
};

const remove = async (id) => {
  const expense = await get(id);
  if (!expense) return null;
  expense.removed = true;
  return ExpenseRepository.save(expense);
};

module.exports = { list, get, create, update, remove };
