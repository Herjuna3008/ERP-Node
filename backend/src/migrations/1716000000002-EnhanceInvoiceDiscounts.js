class EnhanceInvoiceDiscounts1716000000002 {
  async up(queryRunner) {
    await queryRunner.query("ALTER TABLE `invoices` ADD `globalDiscountType` varchar(50) NOT NULL DEFAULT 'NONE'");
    await queryRunner.query("ALTER TABLE `invoices` ADD `globalDiscountValue` decimal(10,2) NOT NULL DEFAULT '0.00'");
    await queryRunner.query("ALTER TABLE `invoice_items` ADD `discountType` varchar(50) NOT NULL DEFAULT 'NONE'");
    await queryRunner.query("ALTER TABLE `invoice_items` ADD `discountValue` decimal(10,2) NOT NULL DEFAULT '0.00'");
    await queryRunner.query("ALTER TABLE `invoice_items` ADD `sellPrice` decimal(10,2) NOT NULL DEFAULT '0.00'");
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE `invoice_items` DROP COLUMN `sellPrice`');
    await queryRunner.query('ALTER TABLE `invoice_items` DROP COLUMN `discountValue`');
    await queryRunner.query('ALTER TABLE `invoice_items` DROP COLUMN `discountType`');
    await queryRunner.query('ALTER TABLE `invoices` DROP COLUMN `globalDiscountValue`');
    await queryRunner.query('ALTER TABLE `invoices` DROP COLUMN `globalDiscountType`');
  }
}

module.exports = EnhanceInvoiceDiscounts1716000000002;
