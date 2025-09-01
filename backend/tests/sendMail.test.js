jest.mock('nodemailer');
jest.mock('@/controllers/pdfController', () => {
  const fs = require('fs');
  const path = require('path');
  return {
    generatePdf: jest.fn((model, info, result, cb) => {
      fs.mkdirSync(path.dirname(info.targetLocation), { recursive: true });
      fs.writeFileSync(info.targetLocation, 'PDF');
      if (cb) cb();
    }),
  };
});

const nodemailer = require('nodemailer');
const { AppDataSource } = require('../src/typeorm-data-source');

describe('sendMail controllers', () => {
  const transport = { sendMail: jest.fn().mockResolvedValue({}) };

  beforeEach(() => {
    nodemailer.createTransport.mockReturnValue(transport);
    transport.sendMail.mockClear();

    process.env.SMTP_HOST = 'smtp.test';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'user@test';
    process.env.SMTP_PASS = 'pass';
    process.env.SMTP_FROM = 'from@test';

    AppDataSource.getRepository = jest.fn(() => ({
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
    }));
  });

  test.each([
    ['invoice', '../src/controllers/appControllers/invoiceController/sendMail', 'invoice-1.pdf'],
    ['quote', '../src/controllers/appControllers/quoteController/sendMail', 'quote-1.pdf'],
    ['payment', '../src/controllers/appControllers/paymentController/sendMail', 'payment-1.pdf'],
  ])('%s sendMail sends email with attachment', async (name, modulePath, filename) => {
    const sendMail = require(modulePath);
    const req = {
      params: { id: 1 },
      body: { email: 'client@example.com', subject: 'Test' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendMail(req, res);

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'client@example.com',
        attachments: [expect.objectContaining({ filename })],
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

