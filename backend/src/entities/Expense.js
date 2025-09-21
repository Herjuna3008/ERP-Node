const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Expense',
  tableName: 'expenses',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    description: { type: 'text', nullable: true },
    reference: { type: 'varchar', length: 191, nullable: true },
    amount: { type: 'float', default: 0 },
    expenseDate: { type: 'date' },
    createdBy: { type: 'int', nullable: true },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'ExpenseCategory',
      joinColumn: { name: 'category' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: { name: 'supplier' },
      onDelete: 'SET NULL',
      nullable: true,
    },
  },
});
