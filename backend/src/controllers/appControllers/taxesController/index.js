const { AppDataSource } = require('@/typeorm-data-source');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');

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
    result: addId(result),
    message: 'Tax created successfully',
  });
};

methods.delete = async (req, res) => {
<<<<<<< HEAD
  const id = parseInt(req.params.id, 10);
  const tax = await repository.findOne({ where: { id, removed: false } });
  if (!tax) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Tax not found',
    });
  }

  const count = await repository.count({ where: { removed: false } });
  if (count <= 1) {
    return res.status(422).json({
      success: false,
      result: null,
      message: 'You cannot delete the tax because it is the only existing one',
    });
  }

  tax.removed = true;
  await repository.save(tax);

  if (tax.isDefault) {
    await repository
      .createQueryBuilder()
      .update()
      .set({ isDefault: true })
      .where('id != :id AND removed = false', { id })
      .limit(1)
      .execute();
  }

  return res.status(200).json({
    success: true,
    result: addId(tax),
    message: 'Tax deleted successfully',
=======
  return res.status(403).json({
    success: false,
    result: null,
    message: "you can't delete tax after it has been created, contact developer to delete tax",
>>>>>>> b1f3ca8 (update)
  });
};

methods.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const tax = await repository.findOne({ where: { id, removed: false } });
  if (!tax) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Tax not found',
    });
  }

  const { isDefault = tax.isDefault, enabled = tax.enabled } = req.body;

  const taxesCount = await repository.count();
  if ((!enabled || !isDefault) && taxesCount <= 1) {
    return res.status(422).json({
      success: false,
      result: null,
      message: 'You cannot disable the tax because it is the only existing one',
    });
  }

  if (tax.isDefault && (!isDefault || !enabled)) {
    await repository
      .createQueryBuilder()
      .update()
      .set({ isDefault: true })
      .where('id != :id AND enabled = true', { id })
      .execute();
  } else if (isDefault) {
    await repository
      .createQueryBuilder()
      .update()
      .set({ isDefault: false })
      .where('id != :id', { id })
      .execute();
  }

  const merged = repository.merge(tax, { ...req.body, isDefault, enabled });
  const result = await repository.save(merged);
  return res.status(200).json({
    success: true,
    message: 'Tax updated successfully',
    result: addId(result),
  });
};

module.exports = methods;
