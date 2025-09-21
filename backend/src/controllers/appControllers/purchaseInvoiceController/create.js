const purchaseInvoiceService = require('@/services/purchaseInvoiceService');

const create = async (req, res) => {
  const payload = req.body || {};
  const invoice = await purchaseInvoiceService.createPurchaseInvoice(payload, req.admin?.id);
  return res.status(200).json({ success: true, result: invoice, message: 'Purchase invoice created' });
};

module.exports = create;
