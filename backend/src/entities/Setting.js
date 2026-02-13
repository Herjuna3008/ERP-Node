const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Setting',
  tableName: 'settings',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    enabled: { type: 'boolean', default: true },
    settingCategory: { type: 'varchar', length: 255 },
    settingKey: { type: 'varchar', length: 255 },
    settingValue: { type: 'simple-json', nullable: true },
    valueType: { type: 'varchar', default: 'String' },
    isPrivate: { type: 'boolean', default: false },
    isCoreSetting: { type: 'boolean', default: false },
    created: { type: 'datetime', default: () => "'2000-01-01 00:00:00'" },
    updated: { type: 'datetime', default: () => "'2000-01-01 00:00:00'" },
  },
});
