const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'StockLedger',
  tableName: 'stock_ledger',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    referenceType: { type: 'varchar', length: 100 },
    referenceNumber: { type: 'varchar', length: 100, nullable: true },
    movementType: { type: 'varchar', length: 50 },
    quantity: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    balance: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    notes: { type: 'text', nullable: true },
    occurredAt: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'productId' },
      onDelete: 'CASCADE',
    },
    invoice: {
      type: 'many-to-one',
      target: 'Invoice',
      joinColumn: { name: 'invoiceId' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    purchaseInvoice: {
      type: 'many-to-one',
      target: 'PurchaseInvoice',
      joinColumn: { name: 'purchaseInvoiceId' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});
