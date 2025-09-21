const purchaseInvoiceService = require('@/services/purchaseInvoiceService');

const read = async (req, res) => {
  const invoice = await purchaseInvoiceService.loadInvoice(req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, result: null, message: 'Purchase invoice not found' });
  }
  return res.status(200).json({ success: true, result: invoice, message: 'Purchase invoice loaded' });
};

module.exports = read;
