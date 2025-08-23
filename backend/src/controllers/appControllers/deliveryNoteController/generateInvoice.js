const service = require('@/services/deliveryNoteService');

const generateInvoice = async (req, res) => {
  const { id } = req.params;
  const result = await service.generateInvoice(id, req.admin.id);
  if (result.error) {
    return res.status(400).json({ success: false, result: null, message: result.error });
  }
  return res.status(200).json({
    success: true,
    result,
    message: 'Invoice generated successfully',
  });
};

module.exports = generateInvoice;
