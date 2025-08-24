const { AppDataSource } = require('@/typeorm-data-source');
const repository = AppDataSource.getRepository('Payroll');

const summary = async (req, res) => {
  try {
    const qb = repository
      .createQueryBuilder('payroll')
      .select("DATE_FORMAT(payroll.date, '%Y-%m-01')", 'month')
      .addSelect('SUM(payroll.amount)', 'total')
      .where('payroll.removed = :removed', { removed: false })
      .groupBy('month')
      .orderBy('month', 'DESC');

    const data = await qb.getRawMany();

    return res.status(200).json({
      success: true,
      result: data,
      message: 'Successfully fetched payroll totals per month',
    });
  } catch (error) {
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = summary;
