const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar', length: 255 },
    sku: { type: 'varchar', length: 100, nullable: true },
    price: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    costPrice: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    unit: { type: 'varchar', length: 50, nullable: true },
    stock: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    description: { type: 'text', nullable: true },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'Setting',
      joinColumn: { name: 'categoryId' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});
