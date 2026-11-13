// Replays the stock ledger for every product and rewrites the derived
// aggregates (stockQuantity, lastCostPrice, lastSellPrice). Idempotent.
require('module-alias/register');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { AppDataSource, initializeDataSource } = require('../typeorm-data-source');
const { recalculateProductAggregates } = require('../services/stockLedgerService');

(async () => {
  try {
    await initializeDataSource();
    const products = await AppDataSource.getRepository('Product').find({ where: { removed: false } });
    for (const product of products) {
      const updated = await recalculateProductAggregates(product.id);
      console.log(`${product.sku || product.id}: stock ${updated.stockQuantity}, cost ${updated.lastCostPrice}, sell ${updated.lastSellPrice}`);
    }
    console.log(`Recalculated ${products.length} product(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Recalc failed:', err);
    process.exit(1);
  }
})();
