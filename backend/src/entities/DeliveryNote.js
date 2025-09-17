const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'DeliveryNote',
  tableName: 'delivery_notes',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    client: { type: 'int' },
    date: { type: 'date', default: () => 'CURRENT_TIMESTAMP' },
    status: { type: 'varchar', default: 'draft' },
    notes: { type: 'text', nullable: true },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
