const path = require('path');
const fs = require('fs');
const { globSync } = require('glob');
const { generate: uniqueId } = require('shortid');
const bcrypt = require('bcryptjs');

const loadDefaultSettings = () => {
  const settingsPath = path.join(__dirname, 'defaultSettings', '**', '*.json');
  const settingFiles = [];

  for (const filePath of globSync(settingsPath)) {
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    settingFiles.push(...fileData);
  }

  return settingFiles;
};

const ensureBootstrapData = async (dataSource, options = {}) => {
  const {
    createDemoAdmin = true,
    logger = console,
    adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com',
    adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    adminName = process.env.DEFAULT_ADMIN_NAME || 'IDURAR',
    adminSurname = process.env.DEFAULT_ADMIN_SURNAME || 'Admin',
  } = options;

  const Admin = dataSource.getRepository('Admin');
  const AdminPassword = dataSource.getRepository('AdminPassword');
  const Setting = dataSource.getRepository('Setting');
  const PaymentMode = dataSource.getRepository('PaymentMode');
  const Taxes = dataSource.getRepository('Taxes');

  const [adminCount, settingCount, paymentModeCount, taxesCount] = await Promise.all([
    Admin.count(),
    Setting.count(),
    PaymentMode.count(),
    Taxes.count(),
  ]);

  if (createDemoAdmin && adminCount === 0) {
    const salt = uniqueId();
    const passwordHash = bcrypt.hashSync(salt + adminPassword);

    const createdAdmin = await Admin.save({
      email: adminEmail,
      name: adminName,
      surname: adminSurname,
      enabled: true,
      role: 'owner',
    });

    await AdminPassword.save({
      password: passwordHash,
      emailVerified: true,
      salt,
      user: createdAdmin,
      loggedSessions: [],
    });

    logger.log(`Seeded default admin account (${adminEmail}).`);
  }

  if (settingCount === 0) {
    const settings = loadDefaultSettings();
    if (settings.length > 0) {
      await Setting.save(settings);
    }
    logger.log(`Seeded default settings (${settings.length} records).`);
  }

  if (taxesCount === 0) {
    await Taxes.save({ taxName: 'Tax 0%', taxValue: '0', isDefault: true });
    logger.log('Seeded default tax configuration.');
  }

  if (paymentModeCount === 0) {
    await PaymentMode.save({
      name: 'Default Payment',
      description: 'Default Payment Mode (Cash , Wire Transfert)',
      isDefault: true,
    });
    logger.log('Seeded default payment mode.');
  }
};

module.exports = { ensureBootstrapData };
