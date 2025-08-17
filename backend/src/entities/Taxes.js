const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Taxes',
  tableName: 'taxes',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    enabled: { type: 'boolean', default: true },
    taxName: { type: 'varchar', length: 255 },
    taxValue: { type: 'float' },
    isDefault: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
