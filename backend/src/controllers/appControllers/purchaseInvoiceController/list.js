const purchaseInvoiceService = require('@/services/purchaseInvoiceService');

const list = async (req, res) => {
  const { skip, take, status, supplier } = req.query;
  const payload = await purchaseInvoiceService.listPurchaseInvoices({ skip, take, status, supplier });
  return res.status(200).json({
    success: true,
    result: payload.result,
    totalCount: payload.total,
    message: 'Purchase invoices loaded',
  });
};

module.exports = list;
