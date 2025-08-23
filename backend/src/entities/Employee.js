const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Employee',
  tableName: 'employees',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar', length: 255 },
    position: { type: 'varchar', length: 255, nullable: true },
    salary: { type: 'float', default: 0 },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
