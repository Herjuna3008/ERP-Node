const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');
const stockLedgerService = require('@/services/stockLedgerService');

const list = async (req, res) => {
  const entries = await stockLedgerService.list();
  return res.status(200).json({
    success: true,
    result: addId(entries),
    message: 'Stock ledger retrieved successfully',
  });
};

module.exports = { list };
