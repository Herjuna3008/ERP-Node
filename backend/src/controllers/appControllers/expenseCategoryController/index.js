const expenseCategoryService = require('@/services/expenseCategoryService');

const list = async (req, res) => {
  const result = await expenseCategoryService.list();
  return res.status(200).json({ success: true, result, message: 'Expense categories loaded' });
};

const create = async (req, res) => {
  const category = await expenseCategoryService.create(req.body || {});
  return res.status(200).json({ success: true, result: category, message: 'Expense category created' });
};

const read = async (req, res) => {
  const category = await expenseCategoryService.get(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, result: null, message: 'Expense category not found' });
  }
  return res.status(200).json({ success: true, result: category, message: 'Expense category loaded' });
};

const update = async (req, res) => {
  const category = await expenseCategoryService.update(req.params.id, req.body || {});
  if (!category) {
    return res.status(404).json({ success: false, result: null, message: 'Expense category not found' });
  }
  return res.status(200).json({ success: true, result: category, message: 'Expense category updated' });
};

const remove = async (req, res) => {
  const category = await expenseCategoryService.remove(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, result: null, message: 'Expense category not found' });
  }
  return res.status(200).json({ success: true, result: category, message: 'Expense category removed' });
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
