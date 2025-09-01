const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Payment');
const Invoice = AppDataSource.getRepository('Invoice');
const { updateInvoicePayment } = require('@/services/invoiceService');

const { calculate } = require('@/helpers');

const create = async (req, res) => {
  // Creating a new document in the collection
  if (req.body.amount <= 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The minimum amount should be greater than 0`,
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

  let payment = await Model.save(Model.create(req.body));

  const fileId = 'payment-' + payment.id + '.pdf';
  payment.pdf = fileId;
  payment = await Model.save(payment);

  const updatedInvoice = await updateInvoicePayment(payment.invoice);

  // Returning successful response
  return res.status(200).json({
    success: true,
    result: { payment, invoice: updatedInvoice },
    message: 'Payment Invoice created successfully',
  });
};

module.exports = create;
