const { AppDataSource } = require('@/typeorm-data-source');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const repository = AppDataSource.getRepository('Taxes');
const methods = createCRUDController(repository);

// Override create to handle default tax logic
methods.create = async (req, res) => {
  const { isDefault } = req.body;
  if (isDefault) {
    await repository.createQueryBuilder().update().set({ isDefault: false }).execute();
  }
  const countDefault = await repository.count({ where: { isDefault: true } });
  const tax = repository.create({
    ...req.body,
    isDefault: countDefault < 1 ? true : false,
  });
  const result = await repository.save(tax);
  return res.status(200).json({
    success: true,
    result,
    message: 'Tax created successfully',
  });
};

methods.delete = async (req, res) => {
  return res.status(403).json({
    success: false,
    result: null,
    message: "you can't delete tax after it has been created",
  });
};

methods.update = async (req, res) => {
  const { id } = req.params;
  const tax = await repository.findOne({ where: { id, removed: false } });
  const { isDefault = tax.isDefault, enabled = tax.enabled } = req.body;

  if (!isDefault || (!enabled && isDefault)) {
    await repository
      .createQueryBuilder()
      .update()
      .set({ isDefault: true })
      .where('id != :id AND enabled = true', { id })
      .execute();
  }

  if (isDefault && enabled) {
    await repository
      .createQueryBuilder()
      .update()
      .set({ isDefault: false })
      .where('id != :id', { id })
      .execute();
  }

  const taxesCount = await repository.count();
  if ((!enabled || !isDefault) && taxesCount <= 1) {
    return res.status(422).json({
      success: false,
      result: null,
      message: 'You cannot disable the tax because it is the only existing one',
    });
  }

  await repository.update(id, req.body);
  const result = await repository.findOne({ where: { id } });
  return res.status(200).json({
    success: true,
    message: 'Tax updated successfully',
    result,
  });
};

module.exports = methods;
