require('reflect-metadata');
const { DataSource } = require('typeorm');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const Client = require('./entities/Client');
const Invoice = require('./entities/Invoice');
const InvoiceItem = require('./entities/InvoiceItem');
const Payment = require('./entities/Payment');
const PaymentMode = require('./entities/PaymentMode');
const Quote = require('./entities/Quote');
const Taxes = require('./entities/Taxes');
const Admin = require('./entities/Admin');
const AdminPassword = require('./entities/AdminPassword');
const Setting = require('./entities/Setting');
const Product = require('./entities/Product');
const Supplier = require('./entities/Supplier');
const PurchaseInvoice = require('./entities/PurchaseInvoice');
const PurchaseInvoiceItem = require('./entities/PurchaseInvoiceItem');
const ExpenseCategory = require('./entities/ExpenseCategory');
const Expense = require('./entities/Expense');
const StockLedger = require('./entities/StockLedger');

// Collect environment variables using multiple fallbacks so that the
// configuration works both with the legacy `DB_*` variables that this project
// historically used as well as the `MYSQL*` variables exposed by many hosting
// providers (Railway, Vercel, Render, etc.).
const getEnv = (keys, defaultValue = undefined) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== '') {
      return value;
    }
  }
  return defaultValue;
};

const connectionUrl = getEnv(['DATABASE_URL', 'DB_URL', 'MYSQL_URL']);

// When a connection string is provided we let TypeORM parse it. Otherwise we
// fall back to the discrete configuration options.
const connectionConfig = connectionUrl
  ? {
      type: 'mysql',
      url: connectionUrl,
    }
  : {
      type: 'mysql',
      host: getEnv(['DB_HOST', 'MYSQLHOST', 'MYSQL_HOST'], '127.0.0.1'),
      port: parseInt(getEnv(['DB_PORT', 'MYSQLPORT', 'MYSQL_PORT'], '3306'), 10),
      username: getEnv(['DB_USER', 'MYSQLUSER', 'MYSQL_USER'], 'root'),
      password: getEnv(['DB_PASSWORD', 'MYSQLPASSWORD', 'MYSQL_PASSWORD'], ''),
      database: getEnv(
        ['DB_NAME', 'MYSQLDATABASE', 'MYSQL_DB', 'MYSQL_DATABASE'],
        'erp'
      ),
    };

const AppDataSource = new DataSource({
  ...connectionConfig,
  synchronize: false,
  logging: false,
  entities: [
    Client,
    Invoice,
    Payment,
    PaymentMode,
    Quote,
    Taxes,
    Admin,
    AdminPassword,
    Setting,
    Product,
    Supplier,
    PurchaseInvoice,
    PurchaseInvoiceItem,
    ExpenseCategory,
    Expense,
    StockLedger,
  ],
});

module.exports = { AppDataSource };
