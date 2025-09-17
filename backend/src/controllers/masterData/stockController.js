const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const stockService = require('@/services/stockService');

const low = async (req, res) => {
  const products = await stockService.getLow();
  return res.status(200).json({
    success: true,
    result: addId(products),
    message: 'Low stock products retrieved successfully',
  });
};

const adjust = async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await stockService.adjust({ productId, quantity });
  if (!product) {
    return res.status(404).json({ success: false, result: null, message: 'Product not found' });
  }
  return res.status(200).json({
    success: true,
    result: addId(product),
    message: 'Stock adjusted successfully',
  });
};

module.exports = { low, adjust };
