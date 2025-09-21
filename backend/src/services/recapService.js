const ExcelJS = require('exceljs');
const { Between, Not } = require('typeorm');
const { AppDataSource } = require('@/typeorm-data-source');

const InvoiceRepository = AppDataSource.getRepository('Invoice');
const PurchaseInvoiceRepository = AppDataSource.getRepository('PurchaseInvoice');
const ExpenseRepository = AppDataSource.getRepository('Expense');

const normaliseDate = (value) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const buildPeriodFilter = (startDate, endDate) => {
  const start = normaliseDate(startDate);
  const end = normaliseDate(endDate);
  if (!start || !end) return undefined;
  return Between(start, end);
};

const getSalesData = async (startDate, endDate) => {
  const period = buildPeriodFilter(startDate, endDate);
  const where = { removed: false, status: Not('draft') };
  if (period) where.date = period;
  const invoices = await InvoiceRepository.find({ where, order: { date: 'ASC', id: 'ASC' } });
  const items = invoices.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    date: invoice.date,
    client: invoice.client,
    total: invoice.total,
  }));
  const total = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  return { items, total };
};

const getPurchaseData = async (startDate, endDate) => {
  const period = buildPeriodFilter(startDate, endDate);
  const where = { removed: false, status: Not('draft') };
  if (period) where.date = period;
  const purchases = await PurchaseInvoiceRepository.find({
    where,
    relations: ['supplier'],
    order: { date: 'ASC', id: 'ASC' },
  });
  const items = purchases.map((purchase) => ({
    id: purchase.id,
    number: purchase.number,
    date: purchase.date,
    supplier: purchase.supplier?.name || null,
    total: purchase.total,
  }));
  const total = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  return { items, total };
};

const getExpenseData = async (startDate, endDate) => {
  const period = buildPeriodFilter(startDate, endDate);
  const where = { removed: false };
  if (period) where.expenseDate = period;
  const expenses = await ExpenseRepository.find({
    where,
    relations: ['category', 'supplier'],
    order: { expenseDate: 'ASC', id: 'ASC' },
  });
  const items = expenses.map((expense) => ({
    id: expense.id,
    date: expense.expenseDate,
    description: expense.description,
    category: expense.category?.name || null,
    supplier: expense.supplier?.name || null,
    amount: expense.amount,
  }));
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return { items, total };
};

const generateRecapData = async ({ startDate, endDate }) => {
  const [sales, purchases, expenses] = await Promise.all([
    getSalesData(startDate, endDate),
    getPurchaseData(startDate, endDate),
    getExpenseData(startDate, endDate),
  ]);

  const profit = sales.total - purchases.total - expenses.total;

  return {
    period: { startDate, endDate },
    sales,
    purchases,
    expenses,
    totals: {
      sales: sales.total,
      purchases: purchases.total,
      expenses: expenses.total,
      profit,
    },
  };
};

const appendTableToSheet = (sheet, { title, headers, rows }, startRow) => {
  let rowIndex = startRow;
  const titleRow = sheet.getRow(rowIndex++);
  titleRow.getCell(1).value = title;
  titleRow.font = { bold: true, size: 14 };
  sheet.mergeCells(rowIndex - 1, 1, rowIndex - 1, headers.length);

  const headerRow = sheet.getRow(rowIndex++);
  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header;
    headerRow.font = { bold: true };
  });

  rows.forEach((row) => {
    const dataRow = sheet.getRow(rowIndex++);
    row.forEach((value, index) => {
      dataRow.getCell(index + 1).value = value;
    });
  });

  return rowIndex;
};

const buildWorkbook = async (recapData) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Recap');

  let currentRow = 1;
  currentRow = appendTableToSheet(
    sheet,
    {
      title: 'Sales',
      headers: ['Invoice #', 'Date', 'Client', 'Total'],
      rows: recapData.sales.items.map((item) => [item.number, item.date, item.client, item.total]),
    },
    currentRow
  );

  currentRow += 2;
  currentRow = appendTableToSheet(
    sheet,
    {
      title: 'Purchases',
      headers: ['Invoice #', 'Date', 'Supplier', 'Total'],
      rows: recapData.purchases.items.map((item) => [item.number, item.date, item.supplier, item.total]),
    },
    currentRow
  );

  currentRow += 2;
  currentRow = appendTableToSheet(
    sheet,
    {
      title: 'Expenses',
      headers: ['Date', 'Category', 'Supplier', 'Description', 'Amount'],
      rows: recapData.expenses.items.map((item) => [
        item.date,
        item.category,
        item.supplier,
        item.description,
        item.amount,
      ]),
    },
    currentRow
  );

  currentRow += 2;
  const totalsRow = sheet.getRow(currentRow++);
  totalsRow.getCell(1).value = 'Total Sales';
  totalsRow.getCell(2).value = recapData.totals.sales;
  const purchaseRow = sheet.getRow(currentRow++);
  purchaseRow.getCell(1).value = 'Total Purchases';
  purchaseRow.getCell(2).value = recapData.totals.purchases;
  const expenseRow = sheet.getRow(currentRow++);
  expenseRow.getCell(1).value = 'Total Expenses';
  expenseRow.getCell(2).value = recapData.totals.expenses;
  const profitRow = sheet.getRow(currentRow++);
  profitRow.getCell(1).value = 'Profit';
  profitRow.getCell(2).value = recapData.totals.profit;
  profitRow.font = { bold: true };

  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, cellValue.length + 2);
    });
    column.width = maxLength;
  });

  return workbook;
};

module.exports = {
  generateRecapData,
  buildWorkbook,
};
