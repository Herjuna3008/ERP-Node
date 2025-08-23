const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'DeliveryItem',
  tableName: 'delivery_items',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    quantity: { type: 'float' },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    deliveryNote: {
      type: 'many-to-one',
      target: 'DeliveryNote',
      joinColumn: { name: 'deliveryNote' },
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
