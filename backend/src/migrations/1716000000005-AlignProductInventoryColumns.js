class AlignProductInventoryColumns1716000000005 {
  async up(queryRunner) {
    const tableName = 'products';

    const hasStockQuantity = await queryRunner.hasColumn(tableName, 'stockQuantity');
    const hasStock = await queryRunner.hasColumn(tableName, 'stock');
    if (!hasStockQuantity) {
      if (hasStock) {
        await queryRunner.query(
          "ALTER TABLE `products` CHANGE `stock` `stockQuantity` decimal(12,2) NOT NULL DEFAULT '0.00'"
        );
      } else {
        await queryRunner.query(
          "ALTER TABLE `products` ADD `stockQuantity` decimal(12,2) NOT NULL DEFAULT '0.00'"
        );
      }
    }

    const hasLastCostPrice = await queryRunner.hasColumn(tableName, 'lastCostPrice');
    const hasCostPrice = await queryRunner.hasColumn(tableName, 'costPrice');
    if (!hasLastCostPrice) {
      if (hasCostPrice) {
        await queryRunner.query(
          "ALTER TABLE `products` CHANGE `costPrice` `lastCostPrice` decimal(10,2) NOT NULL DEFAULT '0.00'"
        );
      } else {
        await queryRunner.query(
          "ALTER TABLE `products` ADD `lastCostPrice` decimal(10,2) NOT NULL DEFAULT '0.00'"
        );
      }
    }

    const hasLastSellPrice = await queryRunner.hasColumn(tableName, 'lastSellPrice');
    if (!hasLastSellPrice) {
      await queryRunner.query(
        "ALTER TABLE `products` ADD `lastSellPrice` decimal(10,2) NOT NULL DEFAULT '0.00'"
      );
    }
  }

  async down(queryRunner) {
    const tableName = 'products';

    const hasLastSellPrice = await queryRunner.hasColumn(tableName, 'lastSellPrice');
    if (hasLastSellPrice) {
      await queryRunner.query("ALTER TABLE `products` DROP COLUMN `lastSellPrice`");
    }

    const hasLastCostPrice = await queryRunner.hasColumn(tableName, 'lastCostPrice');
    const hasCostPrice = await queryRunner.hasColumn(tableName, 'costPrice');
    if (hasLastCostPrice && !hasCostPrice) {
      await queryRunner.query(
        "ALTER TABLE `products` CHANGE `lastCostPrice` `costPrice` decimal(10,2) NOT NULL DEFAULT '0.00'"
      );
    }

    const hasStockQuantity = await queryRunner.hasColumn(tableName, 'stockQuantity');
    const hasStock = await queryRunner.hasColumn(tableName, 'stock');
    if (hasStockQuantity && !hasStock) {
      await queryRunner.query(
        "ALTER TABLE `products` CHANGE `stockQuantity` `stock` decimal(12,2) NOT NULL DEFAULT '0.00'"
      );
    }
  }
}

module.exports = AlignProductInventoryColumns1716000000005;
