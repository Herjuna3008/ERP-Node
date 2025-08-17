require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { AppDataSource } = require('../typeorm-data-source');

async function deleteData() {
  await AppDataSource.initialize();
  const Admin = AppDataSource.getRepository('Admin');
  const AdminPassword = AppDataSource.getRepository('AdminPassword');
  const Setting = AppDataSource.getRepository('Setting');
  const PaymentMode = AppDataSource.getRepository('PaymentMode');
  const Taxes = AppDataSource.getRepository('Taxes');

  await Admin.clear();
  await AdminPassword.clear();
  await PaymentMode.clear();
  await Taxes.clear();
  console.log('👍 Admin Deleted. To setup demo admin data, run\n\n\t npm run setup\n\n');
  await Setting.clear();
  console.log('👍 Setting Deleted. To setup Setting data, run\n\n\t npm run setup\n\n');

  process.exit();
}

deleteData();
