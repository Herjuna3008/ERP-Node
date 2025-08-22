const { AppDataSource } = require('@/typeorm-data-source');

const QuoteRepository = AppDataSource.getRepository('Quote');
const InvoiceRepository = AppDataSource.getRepository('Invoice');

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
  const invoiceData = {
    number: quote.number,
    year: quote.year,
    content: quote.content,
    date: quote.date,
    expiredDate: quote.dueDate,
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
    paymentStatus: 'unpaid',
    credit: 0,
  };


  const invoice = await InvoiceRepository.save(InvoiceRepository.create(invoiceData));

  quote.status = 'CONVERTED';
  if (Object.prototype.hasOwnProperty.call(quote, 'converted')) {
    quote.converted = true;
  }
  await QuoteRepository.save(quote);

  return { invoiceId: invoice.id };
};

module.exports = { convertQuoteToInvoice };
