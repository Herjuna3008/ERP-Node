const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PurchaseInvoice',
  tableName: 'purchase_invoices',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    referenceNumber: { type: 'varchar', length: 100 },
    status: { type: 'varchar', length: 50, default: 'draft' },
    issueDate: { type: 'date' },
    dueDate: { type: 'date', nullable: true },
    notes: { type: 'text', nullable: true },
    subTotal: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    taxTotal: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    total: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: { name: 'supplierId' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    items: {
      type: 'one-to-many',
      target: 'PurchaseItem',
      inverseSide: 'purchaseInvoice',
      cascade: ['insert', 'update'],
    },
  },
});
