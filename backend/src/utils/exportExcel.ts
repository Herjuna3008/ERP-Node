import ExcelJS from 'exceljs';

export async function exportToExcel(data: any[], sheetName = 'Sheet1'): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
    data.forEach((row) => worksheet.addRow(row));
  }

  return workbook.xlsx.writeBuffer();
}
