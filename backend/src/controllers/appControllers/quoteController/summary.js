const moment = require('moment');
const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Quote');
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

  const statuses = ['draft', 'pending', 'sent', 'expired', 'declined', 'accepted'];
  const quotes = await Model.find({ where: { removed: false } });
  const total_count = quotes.length;
  const totalsByStatus = {};
  statuses.forEach((s) => (totalsByStatus[s] = { count: 0, total_amount: 0 }));
  quotes.forEach((q) => {
    if (totalsByStatus[q.status]) {
      totalsByStatus[q.status].count += 1;
      totalsByStatus[q.status].total_amount += q.total;
    }
  });
  const result = statuses.map((status) => {
    const { count, total_amount } = totalsByStatus[status];
    const percentage = total_count ? Math.round((count / total_count) * 100) : 0;
    return { status, count, percentage, total_amount };
  });
  const total = quotes.reduce((acc, item) => acc + item.total, 0);
  const finalResult = { total, type: defaultType, performance: result };

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all Quotations for the last ${defaultType}`,
  });
};
module.exports = summary;
