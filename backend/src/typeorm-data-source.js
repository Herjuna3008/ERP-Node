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
const { ensureBootstrapData } = require('./setup/bootstrapDefaults');

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

const getIntegerFromEnv = (keys, defaultValue) => {
  const rawValue = getEnv(keys);
  if (rawValue === undefined) {
    return defaultValue;
  }
  const parsedValue = parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
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
  connectTimeout: getIntegerFromEnv(
    ['DB_CONNECT_TIMEOUT', 'MYSQL_CONNECT_TIMEOUT'],
    10000
  ),
  acquireTimeout: getIntegerFromEnv(
    ['DB_ACQUIRE_TIMEOUT', 'MYSQL_ACQUIRE_TIMEOUT'],
    10000
  ),
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
  migrations: [path.join(__dirname, 'migrations', '*.js')],
});

let initializationPromise;

const connectionRetryErrorCodes = new Set([
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ESOCKETTIMEDOUT',
  'EAI_AGAIN',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ENETUNREACH',
]);

const shouldRetryConnection = (error) => {
  let currentError = error;
  while (currentError) {
    if (currentError.code && connectionRetryErrorCodes.has(currentError.code)) {
      return true;
    }
    currentError = currentError.cause;
  }
  return false;
};

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const initializeDataSource = async () => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      const maxRetries = Math.max(
        1,
        getIntegerFromEnv(
          ['DB_CONNECTION_RETRIES', 'MYSQL_CONNECTION_RETRIES'],
          5
        )
      );
      const retryDelayMs = Math.max(
        0,
        getIntegerFromEnv(['DB_RETRY_DELAY_MS', 'MYSQL_RETRY_DELAY_MS'], 2000)
      );

      let attempt = 0;
      let lastError;
      let dataSource;
      while (attempt < maxRetries && !dataSource) {
        attempt += 1;
        try {
          // Attempt to initialize the connection. If this succeeds we can exit
          // the retry loop immediately.
          dataSource = await AppDataSource.initialize();
          lastError = undefined;
          if (attempt > 1) {
            console.log('Database connection established after retry.');
          }
        } catch (error) {
          lastError = error;
          if (!shouldRetryConnection(error) || attempt >= maxRetries) {
            throw error;
          }
          console.warn(
            `Database connection attempt ${attempt} failed (${error.code ||
              error.message}). Retrying in ${retryDelayMs}ms...`
          );
          await wait(retryDelayMs);
        }
      }

      if (!dataSource) {
        throw lastError;
      }

      const queryRunner = dataSource.createQueryRunner();
      let shouldSynchronize = false;
      try {
        const [schemaInfo] = await queryRunner.query(
          "SELECT COUNT(*) AS tableCount FROM information_schema.tables WHERE table_schema = DATABASE()"
        );
        const rawCount = schemaInfo
          ? schemaInfo.tableCount ?? Object.values(schemaInfo)[0]
          : undefined;
        const tableCount =
          rawCount !== undefined ? parseInt(String(rawCount), 10) : NaN;
        if (!Number.isFinite(tableCount) || tableCount === 0) {
          shouldSynchronize = true;
        }
      } finally {
        await queryRunner.release();
      }

      if (shouldSynchronize) {
        console.log(
          'Database schema is empty; running initial synchronize before applying migrations.'
        );
        await dataSource.synchronize();
      }
      const executedMigrations = await dataSource.runMigrations();
      if (executedMigrations.length > 0) {
        console.log(
          'Executed migrations:',
          executedMigrations.map((migration) => migration.name).join(', ')
        );
      }

      await ensureBootstrapData(dataSource, {
        createDemoAdmin: shouldSynchronize,
      });

      return dataSource;
    })().finally(() => {
      initializationPromise = undefined;
    });
  }

  return initializationPromise;
};

module.exports = { AppDataSource, initializeDataSource };
