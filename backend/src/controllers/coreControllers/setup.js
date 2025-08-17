require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('@/typeorm-data-source');

const setup = async (req, res) => {
  const Admin = AppDataSource.getRepository('Admin');
  const AdminPassword = AppDataSource.getRepository('AdminPassword');
  const Setting = AppDataSource.getRepository('Setting');
  const PaymentMode = AppDataSource.getRepository('PaymentMode');
  const Taxes = AppDataSource.getRepository('Taxes');

  const { name, email, password, language, timezone, country, config = {} } = req.body;

  const objectSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ name, email, password });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  const salt = uniqueId();

  const passwordHash = bcrypt.hashSync(salt + password);

  const accountOwnner = {
    email,
    name,
    role: 'owner',
  };
  const result = await Admin.save(accountOwnner);

  const AdminPasswordData = {
    password: passwordHash,
    emailVerified: true,
    salt: salt,
    user: result,
    loggedSessions: [],
  };
  await AdminPassword.save(AdminPasswordData);

  const settingData = [];

  const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

  for (const filePath of settingsFiles) {
    const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const settingsToUpdate = {
      idurar_app_email: email,
      idurar_app_company_email: email,
      idurar_app_timezone: timezone,
      idurar_app_country: country,
      idurar_app_language: language || 'en_us',
    };

    const newSettings = file.map((x) => {
      const settingValue = settingsToUpdate[x.settingKey];
      return settingValue ? { ...x, settingValue } : { ...x };
    });

    settingData.push(...newSettings);
  }

  for (const data of settingData) {
    await Setting.save(data);
  }

  await Taxes.save({ taxName: 'Tax 0%', taxValue: '0', isDefault: true });

  await PaymentMode.save({
    name: 'Default Payment',
    description: 'Default Payment Mode (Cash , Wire Transfert)',
    isDefault: true,
  });

  return res.status(200).json({
    success: true,
    result: {},
    message: 'Successfully IDURAR App Setup',
  });
};

module.exports = setup;
