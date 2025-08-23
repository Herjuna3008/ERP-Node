const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const service = require('@/services/deliveryNoteService');

const post = async (req, res) => {
  const { id } = req.params;
  const note = await service.post(id);
  if (!note)
    return res.status(404).json({ success: false, result: null, message: 'Not found' });
  return res.status(200).json({
    success: true,
    result: addId(note),
    message: 'Delivery note posted successfully',
  });
};

module.exports = post;
