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
const PurchaseItem = require('./entities/PurchaseItem');
const StockLedger = require('./entities/StockLedger');
const ExpenseCategory = require('./entities/ExpenseCategory');
const Expense = require('./entities/Expense');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'erp',
  synchronize: true,
  logging: false,
  entities: [
    Client,
    Invoice,
    InvoiceItem,
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
    PurchaseItem,
    StockLedger,
    ExpenseCategory,
    Expense,
  ],
  migrations: [path.join(__dirname, 'migrations/*.js')],
});

module.exports = { AppDataSource };
