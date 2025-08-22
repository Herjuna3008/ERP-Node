const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Supplier',
  tableName: 'suppliers',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar', length: 255 },
    email: { type: 'varchar', length: 255, nullable: true },
    phone: { type: 'varchar', length: 50, nullable: true },
    address: { type: 'varchar', length: 255, nullable: true },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
