const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const service = require('@/services/deliveryNoteService');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      message: error.details[0]?.message,
    });
  }
  const note = await service.create(value);
  return res.status(200).json({
    success: true,
    result: addId(note),
    message: 'Delivery note created successfully',
  });
};

module.exports = create;
