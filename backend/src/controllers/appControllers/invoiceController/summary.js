const moment = require('moment');
const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Invoice');

const { loadSettings } = require('@/middlewares/settings');

const summary = async (req, res) => {
  let defaultType = 'month';

  const { type } = req.query;

  const settings = await loadSettings();

  if (type) {
    if (['week', 'month', 'year'].includes(type)) {
      defaultType = type;
    } else {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid type',
      });
    }
  }

  const currentDate = moment();
  let startDate = currentDate.clone().startOf(defaultType);
  let endDate = currentDate.clone().endOf(defaultType);

  const statuses = ['draft', 'pending', 'OVERDUE', 'PAID', 'UNPAID', 'PARTIAL'];
  const invoices = await Model.find({ where: { removed: false } });
  const totalInvoices = { total: invoices.reduce((acc, i) => acc + i.total, 0), count: invoices.length };

  const result = statuses.map((status) => {
    let count = 0;
    if (status === 'OVERDUE') {
      count = invoices.filter((i) => i.expiredDate && i.expiredDate < new Date()).length;
    } else if (['PAID', 'UNPAID', 'PARTIAL'].includes(status)) {
      count = invoices.filter((i) => i.paymentStatus === status).length;
    } else {
      count = invoices.filter((i) => i.status === status).length;
    }
    const percentage = totalInvoices.count ? Math.round((count / totalInvoices.count) * 100) : 0;
    return { status, count, percentage };
  });

  const unpaid = invoices
    .filter((i) => ['UNPAID', 'PARTIAL'].includes(i.paymentStatus))
    .reduce((acc, i) => acc + (i.total - i.credit), 0);

  const finalResult = {
    total: totalInvoices.total,
    total_undue: unpaid,
    type,
    performance: result,
  };

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all invoices for the last ${defaultType}`,
  });
};

module.exports = summary;
