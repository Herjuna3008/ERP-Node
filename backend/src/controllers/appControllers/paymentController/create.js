const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Payment');
const Invoice = AppDataSource.getRepository('Invoice');
const custom = require('@/controllers/pdfController');

const { calculate } = require('@/helpers');

const create = async (req, res) => {
  // Creating a new document in the collection
  if (req.body.amount === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    });
  }

  const currentInvoice = await Invoice.findOne({
    where: { id: req.body.invoice, removed: false },
  });

  const {
    total: previousTotal,
    discount: previousDiscount,
    credit: previousCredit,
  } = currentInvoice;

  const maxAmount = calculate.sub(calculate.sub(previousTotal, previousDiscount), previousCredit);

  if (req.body.amount > maxAmount) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount}`,
    });
  }
  req.body['createdBy'] = req.admin.id;

  let result = await Model.save(Model.create(req.body));

  const fileId = 'payment-' + result.id + '.pdf';
  result.pdf = fileId;
  let updatePath = await Model.save(result);
  // Returning successfull response

  const { id: paymentId, amount } = result;
  const { id: invoiceId, total, discount, credit } = currentInvoice;

  let paymentStatus =
    calculate.sub(total, discount) === calculate.add(credit, amount)
      ? 'PAID'
      : calculate.add(credit, amount) > 0
      ? 'PARTIAL'
      : 'UNPAID';

  currentInvoice.payment = [...(currentInvoice.payment || []), paymentId];
  currentInvoice.credit = credit + amount;
  currentInvoice.paymentStatus = paymentStatus;
  await Invoice.save(currentInvoice);

  return res.status(200).json({
    success: true,
    result: updatePath,
    message: 'Payment Invoice created successfully',
  });
};

module.exports = create;
