class AddInventoryFieldsToProducts1716000000001 {
  async up(queryRunner) {
    await queryRunner.query("ALTER TABLE `products` ADD `unit` varchar(50) NOT NULL DEFAULT 'unit'");
    await queryRunner.query("ALTER TABLE `products` ADD `costPrice` decimal(10,2) NOT NULL DEFAULT '0.00'");
    await queryRunner.query("ALTER TABLE `products` ADD `stock` decimal(12,2) NOT NULL DEFAULT '0.00'");
    await queryRunner.query("ALTER TABLE `products` ADD `category` varchar(255) NULL");
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE `products` DROP COLUMN `category`');
    await queryRunner.query('ALTER TABLE `products` DROP COLUMN `stock`');
    await queryRunner.query('ALTER TABLE `products` DROP COLUMN `costPrice`');
    await queryRunner.query('ALTER TABLE `products` DROP COLUMN `unit`');
  }
}

module.exports = AddInventoryFieldsToProducts1716000000001;
