const purchaseInvoiceService = require('@/services/purchaseInvoiceService');

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const list = async (req, res) => {
  const { status, supplier } = req.query;

  const page = parseInteger(req.query.page, 1) || 1;
  const items = parseInteger(req.query.items, null);
  const take = parseInteger(req.query.take, items ?? 25) || 25;
  const skip = parseInteger(req.query.skip, (page - 1) * take);

  const payload = await purchaseInvoiceService.listPurchaseInvoices({ skip, take, status, supplier });

  return res.status(200).json({
    success: true,
    result: payload.result,
    pagination: {
      page,
      count: payload.total,
      items: take,
    },
    message: 'Purchase invoices loaded',
  });
};

module.exports = list;
