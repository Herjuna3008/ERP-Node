const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar', length: 255 },
    sku: { type: 'varchar', length: 100, nullable: true },
    unit: { type: 'varchar', length: 50, default: 'unit' },
    price: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    costPrice: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    stock: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    category: { type: 'varchar', length: 255, nullable: true },
    description: { type: 'text', nullable: true },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
