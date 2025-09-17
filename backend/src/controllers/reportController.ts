import { Request, Response } from 'express';
import { AppDataSource } from '@/typeorm-data-source';
import Invoice from '@/entities/Invoice';
import Purchase from '@/entities/Purchase';
import Expense from '@/entities/Expense';
import moment from 'moment';
import { exportToPDF } from '@/utils/exportUtils';
import { exportToExcel } from '@/utils/exportExcel';

const invoiceRepo = () => AppDataSource.getRepository(Invoice as any);
const purchaseRepo = () => AppDataSource.getRepository(Purchase as any);
const expenseRepo = () => AppDataSource.getRepository(Expense as any);

async function handleExport(req: Request, res: Response, data: any, filename: string) {
  const format = (req.query.format as string) || '';
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

export const summary = async (req: Request, res: Response) => {
  const sales = await invoiceRepo()
    .createQueryBuilder('invoice')
    .select('SUM(invoice.total)', 'sum')
    .where('invoice.removed = :removed', { removed: false })
    .getRawOne();
  const purchases = await purchaseRepo()
    .createQueryBuilder('purchase')
    .select('SUM(purchase.total)', 'sum')
    .getRawOne();
  const expenses = await expenseRepo()
    .createQueryBuilder('expense')
    .select('SUM(expense.amount)', 'sum')
    .where('expense.removed = :removed', { removed: false })
    .getRawOne();

  const data = {
    sales: Number(sales?.sum || 0),
    purchases: Number(purchases?.sum || 0),
    expenses: Number(expenses?.sum || 0),
    margin:
      Number(sales?.sum || 0) - Number(purchases?.sum || 0) - Number(expenses?.sum || 0),
  };

  return handleExport(req, res, data, 'summary');
};

export const arAging = async (req: Request, res: Response) => {
  const invoices = await invoiceRepo()
    .createQueryBuilder('invoice')
    .where('invoice.removed = :removed', { removed: false })
    .andWhere('invoice.paymentStatus != :paid', { paid: 'PAID' })
    .getMany();

  const buckets: Record<string, number> = {
    '0-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0,
  };

  invoices.forEach((inv: any) => {
    const outstanding = Number(inv.total) - Number(inv.credit || 0);
    const days = moment().diff(moment(inv.expiredDate), 'days');
    if (days <= 30) buckets['0-30'] += outstanding;
    else if (days <= 60) buckets['31-60'] += outstanding;
    else if (days <= 90) buckets['61-90'] += outstanding;
    else buckets['90+'] += outstanding;
  });

  return handleExport(req, res, buckets, 'ar-aging');
};

export const analytics = async (req: Request, res: Response) => {
  const sales = await invoiceRepo()
    .createQueryBuilder('invoice')
    .select("DATE_FORMAT(invoice.date, '%Y-%m')", 'period')
    .addSelect('SUM(invoice.total)', 'total')
    .where('invoice.removed = :removed', { removed: false })
    .groupBy('period')
    .orderBy('period')
    .getRawMany();

  const purchases = await purchaseRepo()
    .createQueryBuilder('purchase')
    .select("DATE_FORMAT(purchase.date, '%Y-%m')", 'period')
    .addSelect('SUM(purchase.total)', 'total')
    .groupBy('period')
    .orderBy('period')
    .getRawMany();

  const expenses = await expenseRepo()
    .createQueryBuilder('expense')
    .select("DATE_FORMAT(expense.date, '%Y-%m')", 'period')
    .addSelect('SUM(expense.amount)', 'total')
    .where('expense.removed = :removed', { removed: false })
    .groupBy('period')
    .orderBy('period')
    .getRawMany();

  const data = { sales, purchases, expenses };
  return handleExport(req, res, data, 'analytics');
};

export default { summary, arAging, analytics };
