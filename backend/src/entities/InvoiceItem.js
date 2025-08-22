const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'InvoiceItem',
  tableName: 'invoice_items',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    description: { type: 'text', nullable: true },
    quantity: { type: 'float' },
    price: { type: 'float' },
    total: { type: 'float' },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
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
