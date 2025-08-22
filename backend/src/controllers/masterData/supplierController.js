const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const supplierService = require('@/services/masterData/supplierService');

const list = async (req, res) => {
  const suppliers = await supplierService.list();
  return res.status(200).json({
    success: true,
    result: addId(suppliers),
    message: 'Suppliers retrieved successfully',
  });
};

const read = async (req, res) => {
  const supplier = await supplierService.get(parseInt(req.params.id, 10));
  if (!supplier) {
    return res.status(404).json({ success: false, result: null, message: 'Supplier not found' });
  }
  return res.status(200).json({ success: true, result: addId(supplier), message: 'Supplier retrieved successfully' });
};

const create = async (req, res) => {
  const supplier = await supplierService.create(req.body);
  return res.status(200).json({ success: true, result: addId(supplier), message: 'Supplier created successfully' });
};

const update = async (req, res) => {
  const supplier = await supplierService.update(parseInt(req.params.id, 10), req.body);
  if (!supplier) {
    return res.status(404).json({ success: false, result: null, message: 'Supplier not found' });
  }
  return res.status(200).json({ success: true, result: addId(supplier), message: 'Supplier updated successfully' });
};

const remove = async (req, res) => {
  const supplier = await supplierService.remove(parseInt(req.params.id, 10));
  if (!supplier) {
    return res.status(404).json({ success: false, result: null, message: 'Supplier not found' });
  }
  return res.status(200).json({ success: true, result: addId(supplier), message: 'Supplier deleted successfully' });
};

module.exports = { list, read, create, update, delete: remove };
