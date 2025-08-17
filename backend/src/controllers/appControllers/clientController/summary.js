const moment = require('moment');
const { Between } = require('typeorm');
const { AppDataSource } = require('@/typeorm-data-source');

const summary = async (repository, req, res) => {
  let defaultType = 'month';
  const { type } = req.query;

  if (type && ['week', 'month', 'year'].includes(type)) {
    defaultType = type;
  } else if (type) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Invalid type',
    });
  }

  const currentDate = moment();
  let startDate = currentDate.clone().startOf(defaultType);
  let endDate = currentDate.clone().endOf(defaultType);

  try {
    const start = startDate.toDate();
    const end = endDate.toDate();

    const totalClients = await repository.count({
      where: { removed: false, enabled: true },
    });

    const newClients = await repository.count({
      where: { removed: false, enabled: true, created: Between(start, end) },
    });

    const invoiceRepo = AppDataSource.getRepository('Invoice');
    const activeClients = await invoiceRepo
      .createQueryBuilder('invoice')
      .where('invoice.removed = :removed', { removed: false })
      .select('invoice.client')
      .distinct(true)
      .getCount();

    const totalActiveClientsPercentage = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
    const totalNewClientsPercentage = totalClients > 0 ? (newClients / totalClients) * 100 : 0;

    return res.status(200).json({
      success: true,
      result: {
        new: Math.round(totalNewClientsPercentage),
        active: Math.round(totalActiveClientsPercentage),
      },
      message: 'Successfully get summary of new clients',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = summary;
