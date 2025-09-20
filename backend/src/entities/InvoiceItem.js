const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'InvoiceItem',
  tableName: 'invoice_items',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    description: { type: 'text', nullable: true },
    quantity: { type: 'float' },
    price: { type: 'float' },
    discountType: { type: 'varchar', length: 50, default: 'NONE' },
    discountValue: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    sellPrice: { type: 'decimal', precision: 10, scale: 2, default: 0 },
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
