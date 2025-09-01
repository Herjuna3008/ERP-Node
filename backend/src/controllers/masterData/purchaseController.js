const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const purchaseService = require('@/services/purchaseService');
const schema = require('./purchaseSchemaValidate');

const list = async (req, res) => {
  const purchases = await purchaseService.list();
  return res.status(200).json({
    success: true,
    result: addId(purchases),
    message: 'Purchases retrieved successfully',
  });
};

const read = async (req, res) => {
  const purchase = await purchaseService.get(parseInt(req.params.id, 10));
  if (!purchase) {
    return res
      .status(404)
      .json({ success: false, result: null, message: 'Purchase not found' });
  }
  return res.status(200).json({
    success: true,
    result: addId(purchase),
    message: 'Purchase retrieved successfully',
  });
};

const create = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      message: error.details[0]?.message,
    });
  }
  const purchase = await purchaseService.create(value);
  return res.status(200).json({
    success: true,
    result: addId(purchase),
    message: 'Purchase recorded successfully',
  });
};

const update = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      message: error.details[0]?.message,
    });
  }
  const purchase = await purchaseService.update(
    parseInt(req.params.id, 10),
    value
  );
  if (!purchase) {
    return res
      .status(404)
      .json({ success: false, result: null, message: 'Purchase not found' });
  }
  return res.status(200).json({
    success: true,
    result: addId(purchase),
    message: 'Purchase updated successfully',
  });
};

const remove = async (req, res) => {
  const purchase = await purchaseService.remove(parseInt(req.params.id, 10));
  if (!purchase) {
    return res
      .status(404)
      .json({ success: false, result: null, message: 'Purchase not found' });
  }
  return res.status(200).json({
    success: true,
    result: addId(purchase),
    message: 'Purchase deleted successfully',
  });
};

module.exports = { list, read, create, update, delete: remove };
