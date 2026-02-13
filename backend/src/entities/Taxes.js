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
    created: { type: 'datetime', default: () => "'2000-01-01 00:00:00'" },
  },
});
