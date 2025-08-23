const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PurchaseItem',
  tableName: 'purchase_items',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    quantity: { type: 'float' },
    cost: { type: 'float' },
    total: { type: 'float' },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    purchase: {
      type: 'many-to-one',
      target: 'Purchase',
      joinColumn: { name: 'purchase' },
      onDelete: 'CASCADE',
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'product' },
      onDelete: 'CASCADE',
    },
  },
});
