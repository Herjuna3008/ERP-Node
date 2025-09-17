const { TableColumn } = require('typeorm');

module.exports = class AddInvoiceDiscountFields1714000002000 {
  async up(queryRunner) {
    await queryRunner.addColumns('invoices', [
      new TableColumn({
        name: 'globalDiscountType',
        type: 'varchar',
        length: '50',
        isNullable: false,
        default: "'fixed'",
      }),
      new TableColumn({
        name: 'globalDiscountValue',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: '0.00',
      }),
    ]);

    if (await queryRunner.hasTable('invoice_items')) {
      await queryRunner.addColumns('invoice_items', [
        new TableColumn({
          name: 'discountType',
          type: 'varchar',
          length: '50',
          isNullable: false,
          default: "'fixed'",
        }),
        new TableColumn({
          name: 'discountValue',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: '0.00',
        }),
        new TableColumn({
          name: 'sellPriceAfterDiscount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: '0.00',
        }),
      ]);
    }
  }

  async down(queryRunner) {
    if (await queryRunner.hasTable('invoice_items')) {
      await queryRunner.dropColumn('invoice_items', 'sellPriceAfterDiscount');
      await queryRunner.dropColumn('invoice_items', 'discountValue');
      await queryRunner.dropColumn('invoice_items', 'discountType');
    }
    await queryRunner.dropColumn('invoices', 'globalDiscountValue');
    await queryRunner.dropColumn('invoices', 'globalDiscountType');
  }
};
