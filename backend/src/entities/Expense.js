const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Expense',
  tableName: 'expenses',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    description: { type: 'text', nullable: true },
    amount: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    expenseDate: { type: 'date' },
    notes: { type: 'text', nullable: true },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'ExpenseCategory',
      joinColumn: { name: 'categoryId' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: { name: 'supplierId' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    invoice: {
      type: 'many-to-one',
      target: 'Invoice',
      joinColumn: { name: 'invoiceId' },
      onDelete: 'SET NULL',
      nullable: true,
    },
  },
});
