const { AppDataSource } = require('@/typeorm-data-source');

const QuoteRepository = AppDataSource.getRepository('Quote');
const InvoiceRepository = AppDataSource.getRepository('Invoice');
const ClientRepository = AppDataSource.getRepository('Client');

const { readBySettingKey, increaseBySettingKey } = require('@/middlewares/settings');

const convertQuoteToInvoice = async (id, adminId) => {
  const quote = await QuoteRepository.findOne({ where: { id, removed: false } });
  if (!quote) {
    return { error: 'Quote not found' };
  }

  const status = quote.status;

  if (status !== 'SENT') {
    return { error: 'Only sent quotes can be converted' };
  }

  if (quote.converted || status === 'CONVERTED') {
    return { error: 'Quote already converted' };
  }
  // generate new invoice number/year
  const lastNumberSetting = await readBySettingKey({ settingKey: 'last_invoice_number' });
  const number = (lastNumberSetting?.settingValue || 0) + 1;
  const year = new Date().getFullYear();

  // compute expired date based on client default term
  const client = await ClientRepository.findOne({ where: { id: quote.client, removed: false } });
  const term = client?.defaultTerm || client?.term || 0;
  const date = new Date();
  const expiredDate = new Date(date);
  expiredDate.setDate(expiredDate.getDate() + term);

  const invoiceData = {
    number,
    year,
    content: quote.content,
    date,
    expiredDate,
    client: quote.client,
    items: quote.items,
    taxRate: quote.taxRate,
    subTotal: quote.subTotal,
    taxTotal: quote.taxTotal,
    total: quote.total,
    currency: quote.currency,
    discount: quote.discount,
    notes: quote.notes,
    createdBy: adminId,
    paymentStatus: 'UNPAID',
    credit: 0,
  };

  const invoice = await InvoiceRepository.save(InvoiceRepository.create(invoiceData));

  // persist new invoice number for next use
  increaseBySettingKey({ settingKey: 'last_invoice_number' });

  quote.status = 'CONVERTED';
  quote.converted = invoice.id;
  await QuoteRepository.save(quote);

  return { invoiceId: invoice.id };
};

module.exports = { convertQuoteToInvoice };
