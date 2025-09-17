const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Purchase',
  tableName: 'purchases',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    supplier: { type: 'int' },
    date: { type: 'date', default: () => 'CURRENT_TIMESTAMP' },
    total: { type: 'float', default: 0 },
    notes: { type: 'text', nullable: true },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
