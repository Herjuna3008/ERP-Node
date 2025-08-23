const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Payroll',
  tableName: 'payrolls',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    amount: { type: 'float' },
    date: { type: 'date', default: () => 'CURRENT_TIMESTAMP' },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    employee: {
      type: 'many-to-one',
      target: 'Employee',
      joinColumn: { name: 'employee' },
      onDelete: 'SET NULL',
    },
  },
});
