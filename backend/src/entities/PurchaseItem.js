const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PurchaseItem',
  tableName: 'purchase_items',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    description: { type: 'text', nullable: true },
    quantity: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    costPrice: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    total: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    purchaseInvoice: {
      type: 'many-to-one',
      target: 'PurchaseInvoice',
      joinColumn: { name: 'purchaseInvoiceId' },
      onDelete: 'CASCADE',
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'productId' },
      onDelete: 'SET NULL',
      nullable: true,
    },
  },
});
