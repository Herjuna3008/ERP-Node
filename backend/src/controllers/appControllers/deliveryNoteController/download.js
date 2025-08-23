const { AppDataSource } = require('@/typeorm-data-source');
const noteRepository = AppDataSource.getRepository('DeliveryNote');
const itemRepository = AppDataSource.getRepository('DeliveryItem');
const clientRepository = AppDataSource.getRepository('Client');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const download = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const note = await noteRepository.findOne({ where: { id } });
  if (!note) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Delivery note not found',
    });
  }
  const client = note.client
    ? await clientRepository.findOne({ where: { id: note.client } })
    : null;
  const items = await itemRepository.find({
    where: { deliveryNote: id },
    relations: ['product'],
  });

  const templatePath = path.join(__dirname, '../../../pdf/delivery-note.html');
  let html = fs.readFileSync(templatePath, 'utf8');
  const itemsHtml = items
    .map((i) => `<tr><td>${i.product ? i.product.name : ''}</td><td>${i.quantity}</td></tr>`)
    .join('');
  html = html
    .replace('{{number}}', note.id)
    .replace('{{date}}', moment(note.date).format('DD/MM/YYYY'))
    .replace('{{client}}', client ? client.name : '')
    .replace('{{items}}', itemsHtml);

  const folderPath = path.join('src', 'public', 'download', 'deliverynote');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const fileId = `deliverynote-${note.id}.pdf`;
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
