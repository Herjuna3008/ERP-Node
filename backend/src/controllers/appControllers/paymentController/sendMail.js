const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const { AppDataSource } = require('@/typeorm-data-source');
const custom = require('@/controllers/pdfController');
const { SendPaymentReceipt } = require('@/emailTemplate/SendEmailTemplate');

const mail = async (req, res) => {
  try {
    const id = Number(req.params.id || req.body.id);
    const { email, subject = 'Payment Receipt from Idurar', name = '' } =
      req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Payment id is required',
      });
    }

    const paymentRepo = AppDataSource.getRepository('Payment');
    const payment = await paymentRepo.findOne({ where: { id } });

    if (!payment) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Payment not found',
      });
    }

    let to = email;
    let clientName = name;

    if (!to && payment.client) {
      const clientRepo = AppDataSource.getRepository('Client');
      const client = await clientRepo.findOne({ where: { id: payment.client } });
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

    const fileId = `payment-${payment.id}.pdf`;
    const folderPath = path.join('src', 'public', 'download', 'payment');
    const targetLocation = path.join(folderPath, fileId);

    fs.mkdirSync(folderPath, { recursive: true });

    await custom.generatePdf(
      'payment',
      { filename: 'payment', format: 'A4', targetLocation },
      payment
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

    const html = SendPaymentReceipt({
      title: subject,
      name: clientName,
      time: new Date(),
    });

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
