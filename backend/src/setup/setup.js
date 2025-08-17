require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('../typeorm-data-source');

async function setupApp() {
  try {
    await AppDataSource.initialize();
    const Admin = AppDataSource.getRepository('Admin');
    const AdminPassword = AppDataSource.getRepository('AdminPassword');
    const Setting = AppDataSource.getRepository('Setting');
    const PaymentMode = AppDataSource.getRepository('PaymentMode');
    const Taxes = AppDataSource.getRepository('Taxes');

    const salt = uniqueId();
    const passwordHash = bcrypt.hashSync(salt + 'admin123');
    const demoAdmin = {
      email: 'admin@admin.com',
      name: 'IDURAR',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    const result = await Admin.save(demoAdmin);
    await AdminPassword.save({ password: passwordHash, emailVerified: true, salt, user: result, loggedSessions: [] });
    console.log('👍 Admin created : Done!');

    const settingFiles = [];
    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');
    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }
    for (const data of settingFiles) {
      await Setting.save(data);
    }
    console.log('👍 Settings created : Done!');

    await Taxes.save({ taxName: 'Tax 0%', taxValue: '0', isDefault: true });
    console.log('👍 Taxes created : Done!');

    await PaymentMode.save({
      name: 'Default Payment',
      description: 'Default Payment Mode (Cash , Wire Transfert)',
      isDefault: true,
    });
    console.log('👍 PaymentMode created : Done!');

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
