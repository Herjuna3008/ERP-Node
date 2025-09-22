const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { AppDataSource } = require('@/typeorm-data-source');

const repository = AppDataSource.getRepository('PurchaseInvoiceItem');
const methods = createCRUDController(repository);

methods.delete = async (req, res) => {
  const entity = await repository.findOne({ where: { id: req.params.id } });
  if (!entity) {
    return res.status(404).json({ success: false, result: null, message: 'Purchase invoice item not found' });
  }
  await repository.remove(entity);
  return res.status(200).json({ success: true, result: entity, message: 'Purchase invoice item removed' });
};

module.exports = methods;
