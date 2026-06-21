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
const PurchaseInvoice = require('./entities/PurchaseInvoice');
const PurchaseInvoiceItem = require('./entities/PurchaseInvoiceItem');
const ExpenseCategory = require('./entities/ExpenseCategory');
const Expense = require('./entities/Expense');
const StockLedger = require('./entities/StockLedger');
const { ensureBootstrapData } = require('./setup/bootstrapDefaults');


// MySQL `DATE` columns reject full ISO datetime strings such as
// '2026-06-18T03:28:18.047Z' ("Incorrect datetime value"). The frontend date
// pickers (dayjs) serialize to exactly that. Attach a write transformer to every
// `type: 'date'` column so any incoming value (ISO string / Date / 'YYYY-MM-DD')
// is coerced to a plain 'YYYY-MM-DD' before it reaches MySQL.
function coerceToDateOnly(value) {
  if (value === null || value === undefined || value === '') return value;

  const formatLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? value : formatLocal(value);
  }

  const stringValue = String(value);
  // Already starts with a date part (e.g. '2026-06-18' or '2026-06-18T03:28:18Z')
  // -> keep that date part verbatim (avoids any timezone shift).
  const isoMatch = stringValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  const parsed = new Date(stringValue);
  return Number.isNaN(parsed.getTime()) ? value : formatLocal(parsed);
}

function normalizeDateOnlyColumns(entities) {
  for (const entity of entities) {
    const columns = entity?.options?.columns;
    if (!columns) continue;

    for (const columnOptions of Object.values(columns)) {
      if (!columnOptions || typeof columnOptions !== 'object') continue;
      const isDateType =
        typeof columnOptions.type === 'string' && columnOptions.type.toLowerCase() === 'date';
      // Don't clobber a column that already defines its own transformer.
      if (!isDateType || columnOptions.transformer) continue;

      columnOptions.transformer = {
        to: coerceToDateOnly,
        from: (value) => value,
      };
    }
  }
}

function normalizeLegacyDateColumns(entities) {
  for (const entity of entities) {
    const columns = entity?.options?.columns;
    if (!columns) continue;

    for (const columnOptions of Object.values(columns)) {
      if (!columnOptions || typeof columnOptions !== 'object') continue;
      const isDateType =
        typeof columnOptions.type === 'string' && columnOptions.type.toLowerCase() === 'date';
      const hasCurrentTimestampDefault =
        typeof columnOptions.default === 'function' &&
        String(columnOptions.default()).toUpperCase() === 'CURRENT_TIMESTAMP';

      if (!isDateType || !hasCurrentTimestampDefault) {
        continue;
      }

      // MySQL 5.5 does not support CURRENT_TIMESTAMP default on DATE columns.
      delete columnOptions.default;
      columnOptions.legacyAutoDate = true;
    }
  }
}

function normalizeLegacyAuditColumns(entities) {
  for (const entity of entities) {
    const columns = entity?.options?.columns;
    if (!columns) continue;

    for (const [columnName, columnOptions] of Object.entries(columns)) {
      if (!columnOptions || typeof columnOptions !== 'object') continue;

      const isAuditColumn = columnName === 'created' || columnName === 'updated';
      const usesSpecialDateMetadata = columnOptions.createDate || columnOptions.updateDate;
      const usesTimestampType =
        typeof columnOptions.type === 'string' && columnOptions.type.toLowerCase() === 'timestamp';

      if (!isAuditColumn && !usesSpecialDateMetadata && !usesTimestampType) {
        continue;
      }

      // Normalize audit columns for MySQL 5.5 compatibility:
      // - DATETIME cannot use DEFAULT CURRENT_TIMESTAMP
      // - only one TIMESTAMP column may use automatic CURRENT_TIMESTAMP behavior
      columnOptions.type = 'timestamp';
      delete columnOptions.createDate;
      delete columnOptions.updateDate;
      delete columnOptions.precision;

      if (columnName === 'created') {
        // Keep this as a regular timestamp column; a trigger will populate it.
        columnOptions.nullable = true;
        delete columnOptions.default;
        delete columnOptions.onUpdate;
        continue;
      }

      if (!columnOptions.default) {
        columnOptions.default = () => 'CURRENT_TIMESTAMP';
      }

      if (columnName === 'updated') {
        columnOptions.onUpdate = 'CURRENT_TIMESTAMP';
      }
    }
  }
}


async function ensureLegacyDateTriggers(dataSource, entities) {
  const queryRunner = dataSource.createQueryRunner();
  try {
    for (const entity of entities) {
      const tableName = entity?.options?.tableName;
      const createdColumn = entity?.options?.columns?.created;
      const dateColumn = entity?.options?.columns?.date;
      if (!tableName) continue;

      if (createdColumn) {
        const triggerName = `trg_${tableName}_set_created`;
        const [triggerInfo] = await queryRunner.query(
          'SELECT COUNT(*) AS triggerCount FROM information_schema.triggers WHERE trigger_schema = DATABASE() AND trigger_name = ?',
          [triggerName]
        );

        const rawCount = triggerInfo
          ? triggerInfo.triggerCount ?? Object.values(triggerInfo)[0]
          : undefined;
        const triggerCount = rawCount !== undefined ? parseInt(String(rawCount), 10) : 0;
        if (!Number.isFinite(triggerCount) || triggerCount === 0) {
          await queryRunner.query(
            `CREATE TRIGGER \`${triggerName}\` BEFORE INSERT ON \`${tableName}\` FOR EACH ROW SET NEW.\`created\` = IFNULL(NEW.\`created\`, NOW())`
          );
        }
      }

      const dateType =
        typeof dateColumn?.type === 'string' && dateColumn.type.toLowerCase() === 'date';
      const shouldAutoPopulateDate = dateColumn?.legacyAutoDate === true;
      if (!dateType || !shouldAutoPopulateDate) continue;

      const dateTriggerName = `trg_${tableName}_set_date`;
      const [dateTriggerInfo] = await queryRunner.query(
        'SELECT COUNT(*) AS triggerCount FROM information_schema.triggers WHERE trigger_schema = DATABASE() AND trigger_name = ?',
        [dateTriggerName]
      );

      const rawDateTriggerCount = dateTriggerInfo
        ? dateTriggerInfo.triggerCount ?? Object.values(dateTriggerInfo)[0]
        : undefined;
      const dateTriggerCount =
        rawDateTriggerCount !== undefined ? parseInt(String(rawDateTriggerCount), 10) : 0;
      if (!Number.isFinite(dateTriggerCount) || dateTriggerCount === 0) {
        await queryRunner.query(
          `CREATE TRIGGER \`${dateTriggerName}\` BEFORE INSERT ON \`${tableName}\` FOR EACH ROW SET NEW.\`date\` = IFNULL(NEW.\`date\`, CURDATE())`
        );
      }
    }
  } finally {
    await queryRunner.release();
  }
}

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

const entities = [
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
];

normalizeLegacyAuditColumns(entities);
normalizeLegacyDateColumns(entities);
normalizeDateOnlyColumns(entities);

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
  entities: entities,
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
      await ensureLegacyDateTriggers(dataSource, entities);

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
