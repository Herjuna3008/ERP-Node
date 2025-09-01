const { AppDataSource } = require('@/typeorm-data-source');
const PaymentRepository = AppDataSource.getRepository('Payment');
const InvoiceRepository = AppDataSource.getRepository('Invoice');
const { updateInvoicePayment } = require('@/services/invoiceService');
const { calculate } = require('@/helpers');

const payments = async (req, res) => {
  const invoiceId = parseInt(req.params.id, 10);
  const invoice = await InvoiceRepository.findOne({ where: { id: invoiceId, removed: false } });
  if (!invoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  }

  const { amount } = req.body;
  const maxAmount = calculate.sub(
    calculate.sub(invoice.total, invoice.discount || 0),
    invoice.credit || 0
  );

  if (amount <= 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The minimum amount should be greater than 0`,
    });
  }

  if (amount > maxAmount) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount}`,
    });
  }

  const body = {
    ...req.body,
    invoice: invoiceId,
    client: invoice.client,
    createdBy: req.admin.id,
  };

  const payment = await PaymentRepository.save(PaymentRepository.create(body));
  const updatedInvoice = await updateInvoicePayment(invoiceId);

  return res.status(200).json({
    success: true,
    result: { payment, invoice: updatedInvoice },
    message: 'Payment recorded successfully',
  });
};

module.exports = payments;
