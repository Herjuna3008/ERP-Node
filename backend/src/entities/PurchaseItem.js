const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PurchaseItem',
  tableName: 'purchase_items',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    description: { type: 'text', nullable: true },
    quantity: { type: 'decimal', precision: 12, scale: 4, default: 0 },
    costPrice: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    discountType: { type: 'varchar', length: 50, default: 'fixed' },
    discountValue: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    total: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
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
