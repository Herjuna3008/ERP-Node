const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Expense',
  tableName: 'expenses',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    title: { type: 'varchar', length: 255 },
    amount: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    expenseDate: { type: 'date' },
    reference: { type: 'varchar', length: 255, nullable: true },
    notes: { type: 'text', nullable: true },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'ExpenseCategory',
      joinColumn: { name: 'category' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: { name: 'supplier' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    purchaseInvoice: {
      type: 'many-to-one',
      target: 'PurchaseInvoice',
      joinColumn: { name: 'purchaseInvoice' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});
