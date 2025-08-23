const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const service = require('@/services/deliveryNoteService');

const create = async (req, res) => {
  const note = await service.create(req.body);
  return res.status(200).json({
    success: true,
    result: addId(note),
    message: 'Delivery note created successfully',
  });
};

module.exports = create;
