class EnsureStockLedgerEntryType1717000000001 {
  async up(queryRunner) {
    const tableName = 'stock_ledger';

    const hasEntryType = await queryRunner.hasColumn(tableName, 'entryType');
    if (!hasEntryType) {
      await queryRunner.query(
        "ALTER TABLE `stock_ledger` ADD `entryType` varchar(10) NOT NULL DEFAULT 'IN'"
      );
    }

    // Populate sensible defaults for existing rows so that application logic works as expected.
    await queryRunner.query(
      "UPDATE `stock_ledger` SET `entryType` = 'OUT' WHERE `quantity` < 0"
    );
    await queryRunner.query(
      "UPDATE `stock_ledger` SET `entryType` = 'IN' WHERE (`entryType` IS NULL OR `entryType` = '') AND `quantity` >= 0"
    );

    // Ensure quantities are stored as absolute values to match the current business logic.
    await queryRunner.query("UPDATE `stock_ledger` SET `quantity` = ABS(`quantity`)");
  }

  async down(queryRunner) {
    const tableName = 'stock_ledger';
    const hasEntryType = await queryRunner.hasColumn(tableName, 'entryType');
    if (hasEntryType) {
      await queryRunner.query("ALTER TABLE `stock_ledger` DROP COLUMN `entryType`");
    }
  }
}

module.exports = EnsureStockLedgerEntryType1717000000001;
