const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PurchaseInvoice',
  tableName: 'purchase_invoices',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    createdBy: { type: 'int' },
    number: { type: 'varchar', length: 191 },
    year: { type: 'int' },
    status: { type: 'varchar', length: 50, default: 'draft' },
    date: { type: 'date' },
    dueDate: { type: 'date', nullable: true },
    taxRate: { type: 'float', default: 0 },
    subTotal: { type: 'float', default: 0 },
    taxTotal: { type: 'float', default: 0 },
    total: { type: 'float', default: 0 },
    globalDiscountValue: { type: 'float', default: 0 },
    globalDiscountType: { type: 'varchar', length: 20, default: 'amount' },
    notes: { type: 'text', nullable: true },
    currency: { type: 'varchar', length: 10, default: 'NA' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: { name: 'supplier' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    items: {
      type: 'one-to-many',
      target: 'PurchaseInvoiceItem',
      inverseSide: 'invoice',
      cascade: true,
    },
  },
});
