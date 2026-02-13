const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Client',
  tableName: 'clients',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    enabled: { type: 'boolean', default: true },
    name: { type: 'varchar', length: 255 },
    phone: { type: 'varchar', nullable: true },
    country: { type: 'varchar', nullable: true },
    address: { type: 'varchar', nullable: true },
    email: { type: 'varchar', nullable: true },
    createdBy: { type: 'int', nullable: true },
    assigned: { type: 'int', nullable: true },
    created: { type: 'datetime', default: () => "'2000-01-01 00:00:00'" },
    updated: { type: 'datetime', default: () => "'2000-01-01 00:00:00'" },
  },
});
