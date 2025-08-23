const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { AppDataSource } = require('../typeorm-data-source');
const { LessThanOrEqual, In } = require('typeorm');

const schedule = process.env.REMINDER_CRON || '0 9 * * *';

const sendReminder = async () => {
  try {
    const InvoiceRepository = AppDataSource.getRepository('Invoice');
    const invoices = await InvoiceRepository.find({
      where: {
        removed: false,
        paymentStatus: In(['UNPAID', 'PARTIAL']),
        expiredDate: LessThanOrEqual(new Date()),
      },
    });

    if (!invoices.length) {
      return;
    }

    const summary = invoices
      .map((inv) => `Invoice #${inv.number} due on ${inv.expiredDate.toISOString().split('T')[0]}`)
      .join('\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.REMINDER_EMAIL_FROM,
      to: process.env.REMINDER_EMAIL_TO,
      subject: 'Invoice Payment Reminder',
      text: `The following invoices are due or partially paid:\n\n${summary}`,
    });

    console.log('Reminder email sent');
  } catch (err) {
    console.error('Error sending reminder email', err);
  }
};

cron.schedule(schedule, sendReminder);

module.exports = { sendReminder };
