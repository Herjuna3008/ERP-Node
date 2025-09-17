const { TableColumn, TableForeignKey } = require('typeorm');

module.exports = class AddInventoryFieldsToProducts1714000001000 {
  async up(queryRunner) {
    await queryRunner.addColumns('products', [
      new TableColumn({
        name: 'unit',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
      new TableColumn({
        name: 'costPrice',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: '0.00',
      }),
      new TableColumn({
        name: 'stock',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: '0.00',
      }),
      new TableColumn({
        name: 'categoryId',
        type: 'int',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedTableName: 'settings',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('products');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.includes('categoryId'));
      if (foreignKey) {
        await queryRunner.dropForeignKey('products', foreignKey);
      }
    }

    await queryRunner.dropColumn('products', 'categoryId');
    await queryRunner.dropColumn('products', 'stock');
    await queryRunner.dropColumn('products', 'costPrice');
    await queryRunner.dropColumn('products', 'unit');
  }
};
