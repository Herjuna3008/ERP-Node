const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'ExpenseCategory',
  tableName: 'expense_categories',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar', length: 255 },
    description: { type: 'text', nullable: true },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    expenses: {
      type: 'one-to-many',
      target: 'Expense',
      inverseSide: 'category',
    },
  },
});
