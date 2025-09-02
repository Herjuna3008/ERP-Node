const moment = require('moment');
const { AppDataSource } = require('@/typeorm-data-source');
const Invoice = require('@/entities/Invoice');
const Purchase = require('@/entities/Purchase');
const Expense = require('@/entities/Expense');
const { exportToPDF } = require('@/utils/exportUtils');
const { exportToExcel } = require('@/utils/exportExcel');

const invoiceRepo = () => AppDataSource.getRepository(Invoice);
const purchaseRepo = () => AppDataSource.getRepository(Purchase);
const expenseRepo = () => AppDataSource.getRepository(Expense);

async function handleExport(req, res, data, filename) {
  const format = req.query.format;
  if (format === 'pdf') {
    const buffer = await exportToPDF(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    return res.send(buffer);
  }
  if (format === 'excel') {
    const buffer = await exportToExcel(Array.isArray(data) ? data : [data]);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    return res.send(buffer);
  }
  return res.json(data);
}

async function summary(req, res) {
  const { startDate, endDate } = req.query;

  const invoiceQB = invoiceRepo()
    .createQueryBuilder('invoice')
    .select('SUM(invoice.total)', 'sum')
    .where('invoice.removed = :removed', { removed: false });
  if (startDate) {
    invoiceQB.andWhere('invoice.date >= :start', { start: startDate });
  }
  if (endDate) {
    invoiceQB.andWhere('invoice.date <= :end', { end: endDate });
  }
  const sales = await invoiceQB.getRawOne();

  const purchaseQB = purchaseRepo()
    .createQueryBuilder('purchase')
    .select('SUM(purchase.total)', 'sum');
  if (startDate) {
    purchaseQB.andWhere('purchase.date >= :start', { start: startDate });
  }
  if (endDate) {
    purchaseQB.andWhere('purchase.date <= :end', { end: endDate });
  }
  const purchases = await purchaseQB.getRawOne();

  const expenseQB = expenseRepo()
    .createQueryBuilder('expense')
    .select('SUM(expense.amount)', 'sum')
    .where('expense.removed = :removed', { removed: false });
  if (startDate) {
    expenseQB.andWhere('expense.date >= :start', { start: startDate });
  }
  if (endDate) {
    expenseQB.andWhere('expense.date <= :end', { end: endDate });
  }
  const expenses = await expenseQB.getRawOne();

  const data = {
    sales: Number(sales?.sum || 0),
    purchases: Number(purchases?.sum || 0),
    expenses: Number(expenses?.sum || 0),
    margin:
      Number(sales?.sum || 0) - Number(purchases?.sum || 0) - Number(expenses?.sum || 0),
  };

  return handleExport(req, res, data, 'summary');
}

async function arAging(req, res) {
  const invoices = await invoiceRepo()
    .createQueryBuilder('invoice')
    .where('invoice.removed = :removed', { removed: false })
    .andWhere('invoice.paymentStatus != :paid', { paid: 'PAID' })
    .getMany();

  const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

  invoices.forEach((inv) => {
    const outstanding = Number(inv.total) - Number(inv.credit || 0);
    const days = moment().diff(moment(inv.expiredDate), 'days');
    if (days <= 30) buckets['0-30'] += outstanding;
    else if (days <= 60) buckets['31-60'] += outstanding;
    else if (days <= 90) buckets['61-90'] += outstanding;
    else buckets['90+'] += outstanding;
  });

  return handleExport(req, res, buckets, 'ar-aging');
}

async function analytics(req, res) {
  const { startDate, endDate } = req.query;

  const salesQB = invoiceRepo()
    .createQueryBuilder('invoice')
    .select("DATE_FORMAT(invoice.date, '%Y-%m')", 'period')
    .addSelect('SUM(invoice.total)', 'total')
    .where('invoice.removed = :removed', { removed: false });
  if (startDate) {
    salesQB.andWhere('invoice.date >= :start', { start: startDate });
  }
  if (endDate) {
    salesQB.andWhere('invoice.date <= :end', { end: endDate });
  }
  const sales = await salesQB.groupBy('period').orderBy('period').getRawMany();

  const purchaseQB = purchaseRepo()
    .createQueryBuilder('purchase')
    .select("DATE_FORMAT(purchase.date, '%Y-%m')", 'period')
    .addSelect('SUM(purchase.total)', 'total');
  if (startDate) {
    purchaseQB.andWhere('purchase.date >= :start', { start: startDate });
  }
  if (endDate) {
    purchaseQB.andWhere('purchase.date <= :end', { end: endDate });
  }
  const purchases = await purchaseQB
    .groupBy('period')
    .orderBy('period')
    .getRawMany();

  const expenseQB = expenseRepo()
    .createQueryBuilder('expense')
    .select("DATE_FORMAT(expense.date, '%Y-%m')", 'period')
    .addSelect('SUM(expense.amount)', 'total')
    .where('expense.removed = :removed', { removed: false });
  if (startDate) {
    expenseQB.andWhere('expense.date >= :start', { start: startDate });
  }
  if (endDate) {
    expenseQB.andWhere('expense.date <= :end', { end: endDate });
  }
  const expenses = await expenseQB
    .groupBy('period')
    .orderBy('period')
    .getRawMany();

  const data = { sales, purchases, expenses };
  return handleExport(req, res, data, 'analytics');
}

module.exports = { summary, arAging, analytics };
