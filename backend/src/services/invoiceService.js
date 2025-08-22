const { AppDataSource } = require('@/typeorm-data-source');
const { calculate } = require('@/helpers');

const PaymentRepository = AppDataSource.getRepository('Payment');
const InvoiceRepository = AppDataSource.getRepository('Invoice');

const sumPayments = async (invoiceId) => {
  const payments = await PaymentRepository.find({ where: { invoice: invoiceId, removed: false } });
  return payments.reduce((sum, p) => calculate.add(sum, p.amount), 0);
};

const updateInvoicePayment = async (invoiceId) => {
  const invoice = await InvoiceRepository.findOne({ where: { id: invoiceId, removed: false } });
  if (!invoice) return null;
  const payments = await PaymentRepository.find({ where: { invoice: invoiceId, removed: false } });
  const paid = payments.reduce((sum, p) => calculate.add(sum, p.amount), 0);
  const due = calculate.sub(calculate.sub(invoice.total, invoice.discount || 0), paid);
  let status = 'UNPAID';
  if (due <= 0) {
    status = 'PAID';
  } else if (paid > 0) {
    status = 'PARTIAL';
  }
  invoice.credit = paid;
  invoice.paymentStatus = status;
  invoice.payment = payments.map((p) => p.id);
  return InvoiceRepository.save(invoice);
};

module.exports = { sumPayments, updateInvoicePayment };
