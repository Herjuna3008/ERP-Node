const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const productService = require('@/services/masterData/productService');

const list = async (req, res) => {
  const products = await productService.list();
  return res.status(200).json({
    success: true,
    result: addId(products),
    message: 'Products retrieved successfully',
  });
};

const read = async (req, res) => {
  const product = await productService.get(parseInt(req.params.id, 10));
  if (!product) {
    return res.status(404).json({ success: false, result: null, message: 'Product not found' });
  }
  return res.status(200).json({ success: true, result: addId(product), message: 'Product retrieved successfully' });
};

const create = async (req, res) => {
  const product = await productService.create(req.body);
  return res.status(200).json({ success: true, result: addId(product), message: 'Product created successfully' });
};

const update = async (req, res) => {
  const product = await productService.update(parseInt(req.params.id, 10), req.body);
  if (!product) {
    return res.status(404).json({ success: false, result: null, message: 'Product not found' });
  }
  return res.status(200).json({ success: true, result: addId(product), message: 'Product updated successfully' });
};

const remove = async (req, res) => {
  const product = await productService.remove(parseInt(req.params.id, 10));
  if (!product) {
    return res.status(404).json({ success: false, result: null, message: 'Product not found' });
  }
  return res.status(200).json({ success: true, result: addId(product), message: 'Product deleted successfully' });
};

module.exports = { list, read, create, update, delete: remove };
