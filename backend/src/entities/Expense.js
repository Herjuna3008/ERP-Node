const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Expense',
  tableName: 'expenses',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    amount: { type: 'float' },
    date: { type: 'date', default: () => 'CURRENT_TIMESTAMP' },
    description: { type: 'text', nullable: true },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'ExpenseCategory',
      joinColumn: { name: 'category' },
      onDelete: 'SET NULL',
    },
    employee: {
      type: 'many-to-one',
      target: 'Employee',
      joinColumn: { name: 'employee' },
      onDelete: 'SET NULL',
    },
    payroll: {
      type: 'many-to-one',
      target: 'Payroll',
      joinColumn: { name: 'payroll' },
      onDelete: 'CASCADE',
    },
  },
});
