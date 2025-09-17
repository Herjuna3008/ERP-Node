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
const DeliveryNote = require('./entities/DeliveryNote');
const DeliveryItem = require('./entities/DeliveryItem');
const Expense = require('./entities/Expense');
const ExpenseCategory = require('./entities/ExpenseCategory');
const Employee = require('./entities/Employee');
const Payroll = require('./entities/Payroll');

const isTest = process.env.NODE_ENV === 'test';

const dataSourceOptions = {
  type: isTest ? 'sqlite' : 'mysql',
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
    DeliveryNote,
    DeliveryItem,
    Expense,
    ExpenseCategory,
    Employee,
    Payroll,
  ],
};

if (isTest) {
  dataSourceOptions.database = ':memory:';
} else {
  dataSourceOptions.host = process.env.DB_HOST || 'localhost';
  dataSourceOptions.port = parseInt(process.env.DB_PORT || '3306');
  dataSourceOptions.username = process.env.DB_USER || 'root';
  dataSourceOptions.password = process.env.DB_PASSWORD || '';
  dataSourceOptions.database = process.env.DB_NAME || 'erp';
}

const AppDataSource = new DataSource(dataSourceOptions);

module.exports = { AppDataSource };
