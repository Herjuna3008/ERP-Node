const purchaseInvoiceService = require('@/services/purchaseInvoiceService');

const update = async (req, res) => {
  const payload = req.body || {};
  const invoice = await purchaseInvoiceService.updatePurchaseInvoice(req.params.id, payload);
  if (!invoice) {
    return res.status(404).json({ success: false, result: null, message: 'Purchase invoice not found' });
  }
  return res.status(200).json({ success: true, result: invoice, message: 'Purchase invoice updated' });
};

module.exports = update;
