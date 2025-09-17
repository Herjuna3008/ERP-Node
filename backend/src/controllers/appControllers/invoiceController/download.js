const { AppDataSource } = require('@/typeorm-data-source');
const invoiceRepository = AppDataSource.getRepository('Invoice');
const clientRepository = AppDataSource.getRepository('Client');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const download = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const invoice = await invoiceRepository.findOne({ where: { id, removed: false } });
  if (!invoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  }
  const client = invoice.client
    ? await clientRepository.findOne({ where: { id: invoice.client } })
    : null;

  const templatePath = path.join(__dirname, '../../../pdf/invoice.html');
  let html = fs.readFileSync(templatePath, 'utf8');
  const itemsHtml = (invoice.items || [])
    .map(
      (i) =>
        `<tr><td>${i.description || i.item || ''}</td><td>${i.quantity}</td><td>${i.price}</td><td>${i.total}</td></tr>`
    )
    .join('');
  html = html
    .replace('{{number}}', invoice.number || '')
    .replace('{{date}}', moment(invoice.date).format('DD/MM/YYYY'))
    .replace('{{client}}', client ? client.name : '')
    .replace('{{items}}', itemsHtml)
    .replace('{{subTotal}}', invoice.subTotal)
    .replace('{{taxTotal}}', invoice.taxTotal)
    .replace('{{total}}', invoice.total);

  const folderPath = path.join('src', 'public', 'download', 'invoice');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const fileId = `invoice-${invoice.id}.pdf`;
  const targetLocation = path.join(folderPath, fileId);

  pdf
    .create(html, { format: 'A4', orientation: 'portrait', border: '10mm' })
    .toFile(targetLocation, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          result: null,
          message: err.message,
        });
      }
      return res.download(targetLocation);
    });
};

module.exports = download;
