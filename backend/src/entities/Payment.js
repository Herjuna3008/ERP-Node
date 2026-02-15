const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Payment',
  tableName: 'payments',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    createdBy: { type: 'int' },
    number: { type: 'int' },
    client: { type: 'int' },
    date: { type: 'date', default: () => 'CURRENT_TIMESTAMP' },
    amount: { type: 'float' },
    currency: { type: 'varchar', default: 'NA' },
    paymentMode: { type: 'int', nullable: true },
    ref: { type: 'varchar', nullable: true },
    description: { type: 'text', nullable: true },
    pdf: { type: 'varchar', nullable: true },
    updated: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
    created: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    invoice: {
      type: 'many-to-one',
      target: 'Invoice',
      joinColumn: { name: 'invoice' },
      onDelete: 'CASCADE',
    },
  },
});
