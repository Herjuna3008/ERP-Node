const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const { AppDataSource } = require('@/typeorm-data-source');
const custom = require('@/controllers/pdfController');
const { SendInvoice } = require('@/emailTemplate/SendEmailTemplate');

const mail = async (req, res) => {
  try {
    const id = Number(req.params.id || req.body.id);
    const { email, subject = 'Invoice from Idurar', name = '' } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invoice id is required',
      });
    }

    const invoiceRepo = AppDataSource.getRepository('Invoice');
    const invoice = await invoiceRepo.findOne({ where: { id } });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Invoice not found',
      });
    }

    let to = email;
    let clientName = name;

    if (!to && invoice.client) {
      const clientRepo = AppDataSource.getRepository('Client');
      const client = await clientRepo.findOne({ where: { id: invoice.client } });
      to = client ? client.email : to;
      clientName = client ? client.name : clientName;
    }

    if (!to) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Recipient email is required',
      });
    }

    const fileId = `invoice-${invoice.id}.pdf`;
    const folderPath = path.join('src', 'public', 'download', 'invoice');
    const targetLocation = path.join(folderPath, fileId);

    fs.mkdirSync(folderPath, { recursive: true });

    await custom.generatePdf(
      'invoice',
      { filename: 'invoice', format: 'A4', targetLocation },
      invoice
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = SendInvoice({ title: subject, name: clientName, time: new Date() });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments: [
        {
          filename: fileId,
          path: targetLocation,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      result: null,
      message: 'Email sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = mail;
