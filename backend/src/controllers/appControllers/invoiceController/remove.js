const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Invoice');
const ModelPayment = AppDataSource.getRepository('Payment');

const remove = async (req, res) => {
  let deletedInvoice = await Model.findOne({ where: { id: req.params.id, removed: false } });
  if (deletedInvoice) {
    deletedInvoice.removed = true;
    deletedInvoice = await Model.save(deletedInvoice);
  }

  if (!deletedInvoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  }
  await ModelPayment.update({ invoice: deletedInvoice.id }, { removed: true });
  return res.status(200).json({
    success: true,
    result: deletedInvoice,
    message: 'Invoice deleted successfully',
  });
};

module.exports = remove;
