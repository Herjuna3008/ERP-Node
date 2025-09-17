const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'StockLedger',
  tableName: 'stock_ledgers',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    referenceType: { type: 'varchar', length: 100 },
    referenceId: { type: 'int', nullable: true },
    movementType: {
      type: 'enum',
      enum: ['IN', 'OUT'],
      default: 'IN',
    },
    quantity: { type: 'decimal', precision: 12, scale: 4 },
    unitCost: { type: 'decimal', precision: 12, scale: 2, nullable: true },
    totalCost: { type: 'decimal', precision: 14, scale: 2, nullable: true },
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
    purchaseInvoice: {
      type: 'many-to-one',
      target: 'PurchaseInvoice',
      joinColumn: { name: 'purchaseInvoice' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    purchaseItem: {
      type: 'many-to-one',
      target: 'PurchaseItem',
      joinColumn: { name: 'purchaseItem' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});
