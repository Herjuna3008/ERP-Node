require('reflect-metadata');
const { DataSource } = require('typeorm');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const Client = require('./entities/Client');
const Invoice = require('./entities/Invoice');
const Payment = require('./entities/Payment');
const PaymentMode = require('./entities/PaymentMode');
const Quote = require('./entities/Quote');
const Taxes = require('./entities/Taxes');
const Admin = require('./entities/Admin');
const AdminPassword = require('./entities/AdminPassword');
const Setting = require('./entities/Setting');
const Product = require('./entities/Product');
const Supplier = require('./entities/Supplier');
const Purchase = require('./entities/Purchase');
const PurchaseItem = require('./entities/PurchaseItem');
const StockLedger = require('./entities/StockLedger');
const Expense = require('./entities/Expense');
const ExpenseCategory = require('./entities/ExpenseCategory');
const Employee = require('./entities/Employee');
const Payroll = require('./entities/Payroll');

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
    Payment,
    PaymentMode,
    Quote,
    Taxes,
    Admin,
    AdminPassword,
    Setting,
    Product,
    Supplier,
    Purchase,
    PurchaseItem,
    StockLedger,
    Expense,
    ExpenseCategory,
    Employee,
    Payroll,
  ],
});

module.exports = { AppDataSource };
