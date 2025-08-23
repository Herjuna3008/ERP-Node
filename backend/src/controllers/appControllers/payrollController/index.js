const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const { AppDataSource } = require('@/typeorm-data-source');

const repository = AppDataSource.getRepository('Payroll');
const expenseRepository = AppDataSource.getRepository('Expense');

const methods = createCRUDController(repository);

methods.create = async (req, res) => {
  try {
    req.body.removed = false;
    const entity = repository.create({ ...req.body });
    const payroll = await repository.save(entity);
    const expense = expenseRepository.create({
      amount: req.body.amount,
      date: req.body.date,
      description: req.body.description,
      employee: req.body.employee,
      payroll: payroll.id,
      category: req.body.category,
      removed: false,
    });
    await expenseRepository.save(expense);
    return res.status(200).json({
      success: true,
      result: addId(payroll),
      message: 'Successfully Created the document in Model ',
    });
  } catch (error) {
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = methods;
