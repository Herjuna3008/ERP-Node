const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Payment');
const { updateInvoicePayment } = require('@/services/invoiceService');

const remove = async (req, res) => {
  // Find document by id and updates with the required fields
  const previousPayment = await Model.findOne({
    where: { id: req.params.id, removed: false },
  });

  if (!previousPayment) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  const invoiceId = previousPayment.invoice;

  // Find the document by id and delete it
  let updates = {
    removed: true,
  };
  // Find the document by id and delete it
  let entity = await Model.findOne({ where: { id: req.params.id, removed: false } });
  Object.assign(entity, updates);
  const payment = await Model.save(entity);
  // If no results found, return document not found

  const updatedInvoice = await updateInvoicePayment(invoiceId);

  return res.status(200).json({
    success: true,
    result: { payment, invoice: updatedInvoice },
    message: 'Successfully Deleted the document ',
  });
};
module.exports = remove;
