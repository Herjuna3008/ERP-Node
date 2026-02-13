const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Admin',
  tableName: 'admins',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    enabled: { type: 'boolean', default: false },
    email: { type: 'varchar', length: 255 },
    name: { type: 'varchar', length: 255 },
    surname: { type: 'varchar', nullable: true },
    photo: { type: 'varchar', nullable: true },
    role: { type: 'varchar', default: 'owner' },
    created: { type: 'datetime', default: () => "'2000-01-01 00:00:00'" },
    updated: { type: 'datetime', default: () => "'2000-01-01 00:00:00'" },
  },
});
