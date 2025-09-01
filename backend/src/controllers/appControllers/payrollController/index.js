const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { addId, hasColumn } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const { AppDataSource } = require('@/typeorm-data-source');
const schema = require('./schemaValidate');

const repository = AppDataSource.getRepository('Payroll');
const expenseRepository = AppDataSource.getRepository('Expense');

const methods = createCRUDController(repository);
const summary = require('./summary');

methods.create = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      message: error.details[0]?.message,
    });
  }
  try {
    if (hasColumn(repository, 'removed') && value.removed === undefined) {
      value.removed = false;
    }
    const { employee, amount, date, description, category } = value;
    const entity = repository.create({ employee, amount, date, removed: value.removed });
    const payroll = await repository.save(entity);
    const expense = expenseRepository.create({
      amount,
      date,
      description,
      employee,
      payroll: payroll.id,
      category,
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

methods.update = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      message: error.details[0]?.message,
    });
  }
  try {
    if (hasColumn(repository, 'removed') && value.removed === undefined) {
      value.removed = false;
    }
    const where = { id: req.params.id };
    if (hasColumn(repository, 'removed')) where.removed = false;
    let entity = await repository.findOne({ where });
    if (!entity) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    }
    repository.merge(entity, {
      employee: value.employee,
      amount: value.amount,
      date: value.date,
    });
    const payroll = await repository.save(entity);
    return res.status(200).json({
      success: true,
      result: addId(payroll),
      message: 'we update this document ',
    });
  } catch (error) {
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

methods.summary = summary;

module.exports = methods;
