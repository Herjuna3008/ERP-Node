const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PaymentMode',
  tableName: 'payment_modes',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    enabled: { type: 'boolean', default: true },
    name: { type: 'varchar', length: 255 },
    description: { type: 'text', nullable: true },
    ref: { type: 'varchar', nullable: true },
    isDefault: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
