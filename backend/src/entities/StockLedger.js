const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'StockLedger',
  tableName: 'stock_ledger',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    quantity: { type: 'float' },
    type: { type: 'varchar', length: 50 },
    ref: { type: 'int', nullable: true },
    cost: { type: 'float', default: 0 },
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
