const expenseService = require('@/services/expenseService');

const list = async (req, res) => {
  const { category, supplier, startDate, endDate } = req.query;
  const result = await expenseService.list({ category, supplier, startDate, endDate });
  return res.status(200).json({ success: true, result, message: 'Expenses loaded' });
};

const create = async (req, res) => {
  const expense = await expenseService.create({ ...req.body, createdBy: req.admin?.id });
  return res.status(200).json({ success: true, result: expense, message: 'Expense created' });
};

const read = async (req, res) => {
  const expense = await expenseService.get(req.params.id);
  if (!expense) {
    return res.status(404).json({ success: false, result: null, message: 'Expense not found' });
  }
  return res.status(200).json({ success: true, result: expense, message: 'Expense loaded' });
};

const update = async (req, res) => {
  const expense = await expenseService.update(req.params.id, { ...req.body, createdBy: req.admin?.id });
  if (!expense) {
    return res.status(404).json({ success: false, result: null, message: 'Expense not found' });
  }
  return res.status(200).json({ success: true, result: expense, message: 'Expense updated' });
};

const remove = async (req, res) => {
  const expense = await expenseService.remove(req.params.id);
  if (!expense) {
    return res.status(404).json({ success: false, result: null, message: 'Expense not found' });
  }
  return res.status(200).json({ success: true, result: expense, message: 'Expense removed' });
};

module.exports = {
  list,
  listAll: list,
  filter: list,
  search: list,
  create,
  read,
  update,
  delete: remove,
  summary: list,
};
