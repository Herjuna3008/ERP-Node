const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PurchaseInvoice',
  tableName: 'purchase_invoices',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    createdBy: { type: 'int', nullable: true },
    number: { type: 'int', nullable: true },
    year: { type: 'int', nullable: true },
    reference: { type: 'varchar', length: 255, nullable: true },
    date: { type: 'date' },
    dueDate: { type: 'date', nullable: true },
    taxRate: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    subTotal: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    taxTotal: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    discount: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    total: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    status: { type: 'varchar', length: 50, default: 'draft' },
    paymentStatus: { type: 'varchar', length: 50, default: 'UNPAID' },
    currency: { type: 'varchar', length: 10, default: 'NA' },
    notes: { type: 'text', nullable: true },
    files: { type: 'simple-json', nullable: true },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: { name: 'supplier' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    items: {
      type: 'one-to-many',
      target: 'PurchaseItem',
      inverseSide: 'invoice',
    },
  },
});
