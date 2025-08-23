const pdf = require('html-pdf');
const ExcelJS = require('exceljs');

exports.exportToPDF = (html, options = {}) => {
  return new Promise((resolve, reject) => {
    pdf.create(html, { format: 'A4', ...options }).toBuffer((err, buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });
};

exports.exportToExcel = async (data, sheetName = 'Sheet1') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
    data.forEach((row) => worksheet.addRow(row));
  }
  return workbook.xlsx.writeBuffer();
};
