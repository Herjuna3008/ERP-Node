import { Request, Response } from 'express';
import { convertQuoteToInvoice } from '@/services/quoteService';

const convertQuoteToInvoiceController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const adminId = req.admin.id;

  const result = await convertQuoteToInvoice(id, adminId);
  if (result.error) {
    return res.status(404).json({ success: false, result: null, message: result.error });
  }

  return res.status(200).json({
    success: true,
    result: { id: result.invoiceId },
    message: 'Quote converted to invoice successfully',
  });
};

export default convertQuoteToInvoiceController;
