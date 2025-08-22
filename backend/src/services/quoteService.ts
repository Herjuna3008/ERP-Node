import { AppDataSource } from '@/typeorm-data-source';
import { Repository } from 'typeorm';

const QuoteRepository: Repository<any> = AppDataSource.getRepository('Quote');
const InvoiceRepository: Repository<any> = AppDataSource.getRepository('Invoice');

export const convertQuoteToInvoice = async (id: number, adminId: number) => {
  const quote = await QuoteRepository.findOne({ where: { id, removed: false } });
  if (!quote) {
    return { error: 'Quote not found' };
  }

  const status = quote.status?.toLowerCase();

  if (status !== 'accepted') {
    return { error: 'Only accepted quotes can be converted' };
  }

  if (quote.converted || status === 'converted') {
    return { error: 'Quote already converted' };
  }

  const invoiceData: any = {
    number: quote.number,
    year: quote.year,
    content: quote.content,
    date: quote.date,
    expiredDate: quote.expiredDate,
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
  // mark quote as converted if field exists
  if (Object.prototype.hasOwnProperty.call(quote, 'converted')) {
    quote.converted = true;
  }
  await QuoteRepository.save(quote);

  return { invoiceId: invoice.id };
};
