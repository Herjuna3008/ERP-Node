const { AppDataSource } = require('@/typeorm-data-source');
const PaymentRepository = AppDataSource.getRepository('Payment');
const InvoiceRepository = AppDataSource.getRepository('Invoice');
const { updateInvoicePayment } = require('@/services/invoiceService');

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
