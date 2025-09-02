const service = require('@/services/deliveryNoteService');
const schema = require('./schemaValidate');

const update = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, result: null, message: error.details[0]?.message });
  }
  const result = await service.update(req.params.id, value);
  if (!result) {
    return res.status(404).json({ success: false, result: null, message: 'Not found' });
  }
  return res.status(200).json({
    success: true,
    result,
    message: 'Delivery note updated successfully',
  });
};

module.exports = update;
