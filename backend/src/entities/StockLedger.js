const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'StockLedger',
  tableName: 'stock_ledger',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    entryType: { type: 'varchar', length: 10 },
    quantity: { type: 'float', default: 0 },
    costPrice: { type: 'float', default: 0 },
    sellPrice: { type: 'float', default: 0 },
    sourceType: { type: 'varchar', length: 50 },
    sourceId: { type: 'int' },
    sourceItemId: { type: 'int', nullable: true },
    notes: { type: 'text', nullable: true },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'product' },
      onDelete: 'CASCADE',
    },
  },
});
