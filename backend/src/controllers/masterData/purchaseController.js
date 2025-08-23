const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const purchaseService = require('@/services/purchaseService');

const create = async (req, res) => {
  const purchase = await purchaseService.create(req.body);
  return res.status(200).json({
    success: true,
    result: addId(purchase),
    message: 'Purchase recorded successfully',
  });
};

module.exports = { create };
