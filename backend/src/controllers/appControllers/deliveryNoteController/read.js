const service = require('@/services/deliveryNoteService');

const read = async (req, res) => {
  const result = await service.read(req.params.id);
  if (!result) {
    return res.status(404).json({ success: false, result: null, message: 'No document found ' });
  } else {
    return res.status(200).json({ success: true, result, message: 'we found this document ' });
  }
};

module.exports = read;
