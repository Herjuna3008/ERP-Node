const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PurchaseInvoiceItem',
  tableName: 'purchase_invoice_items',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    description: { type: 'text', nullable: true },
    quantity: { type: 'float', default: 0 },
    unitPrice: { type: 'float', default: 0 },
    discountValue: { type: 'float', default: 0 },
    discountType: { type: 'varchar', length: 20, default: 'amount' },
    total: { type: 'float', default: 0 },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    invoice: {
      type: 'many-to-one',
      target: 'PurchaseInvoice',
      joinColumn: { name: 'invoice' },
      onDelete: 'CASCADE',
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'product' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});
