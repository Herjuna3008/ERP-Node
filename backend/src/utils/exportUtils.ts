import pdf from 'html-pdf';
import ExcelJS from 'exceljs';

export function exportToPDF(html: string, options: any = {}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    pdf.create(html, { format: 'A4', ...options }).toBuffer((err: any, buffer: Buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });
}

export async function exportToExcel(data: any[], sheetName = 'Sheet1'): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
    data.forEach((row) => worksheet.addRow(row));
  }
  return workbook.xlsx.writeBuffer();
}
