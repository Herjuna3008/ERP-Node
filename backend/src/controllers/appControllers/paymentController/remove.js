const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Payment');
const Invoice = AppDataSource.getRepository('Invoice');

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

  const { id: paymentId, amount: previousAmount } = previousPayment;
  const invoice = await Invoice.findOne({ where: { id: previousPayment.invoice } });
  const { id: invoiceId, total, discount, credit: previousCredit } = invoice;

  // Find the document by id and delete it
  let updates = {
    removed: true,
  };
  // Find the document by id and delete it
  let entity = await Model.findOne({ where: { id: req.params.id, removed: false } });
  Object.assign(entity, updates);
  const result = await Model.save(entity);
  // If no results found, return document not found

  let paymentStatus =
    total - discount === previousCredit - previousAmount
      ? 'paid'
      : previousCredit - previousAmount > 0
      ? 'partially'
      : 'unpaid';

  invoice.payment = (invoice.payment || []).filter((p) => p !== paymentId);
  invoice.credit = previousCredit - previousAmount;
  invoice.paymentStatus = paymentStatus;
  await Invoice.save(invoice);

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully Deleted the document ',
  });
};
module.exports = remove;
