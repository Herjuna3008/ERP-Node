const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Payment');
const Invoice = AppDataSource.getRepository('Invoice');
const custom = require('@/controllers/pdfController');

const { calculate } = require('@/helpers');

const update = async (req, res) => {
  if (req.body.amount === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    });
  }
  // Find document by id and updates with the required fields
  const previousPayment = await Model.findOne({ where: { id: req.params.id, removed: false } });
  const invoiceRecord = await Invoice.findOne({ where: { id: previousPayment.invoice } });

  const { amount: previousAmount } = previousPayment;
  const { id: invoiceId, total, discount, credit: previousCredit } = invoiceRecord;

  const { amount: currentAmount } = req.body;

  const changedAmount = calculate.sub(currentAmount, previousAmount);
  const maxAmount = calculate.sub(total, calculate.add(discount, previousCredit));

  if (changedAmount > maxAmount) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount + previousAmount}`,
      error: `The Max Amount you can add is ${maxAmount + previousAmount}`,
    });
  }

  let paymentStatus =
    calculate.sub(total, discount) === calculate.add(previousCredit, changedAmount)
      ? 'PAID'
      : calculate.add(previousCredit, changedAmount) > 0
      ? 'PARTIAL'
      : 'UNPAID';

  const updatedDate = new Date();
  const updates = {
    number: req.body.number,
    date: req.body.date,
    amount: req.body.amount,
    paymentMode: req.body.paymentMode,
    ref: req.body.ref,
    description: req.body.description,
    updated: updatedDate,
  };

  Model.merge(previousPayment, updates);
  const result = await Model.save(previousPayment);

  invoiceRecord.credit = previousCredit + changedAmount;
  invoiceRecord.paymentStatus = paymentStatus;
  await Invoice.save(invoiceRecord);

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully updated the Payment ',
  });
};

module.exports = update;
