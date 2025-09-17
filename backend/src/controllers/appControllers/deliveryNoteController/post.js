const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const service = require('@/services/deliveryNoteService');

const post = async (req, res) => {
  const { id } = req.params;
  const result = await service.post(id);
  if (!result)
    return res.status(404).json({ success: false, result: null, message: 'Not found' });
  if (result.error)
    return res
      .status(400)
      .json({ success: false, result: null, message: result.error });
  return res.status(200).json({
    success: true,
    result: addId(result),
    message: 'Delivery note posted successfully',
  });
};

module.exports = post;
