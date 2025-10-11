class AddRemovedToPurchaseInvoices1717000000000 {
  async hasColumn(queryRunner, tableName, columnName) {
    const result = await queryRunner.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, columnName]
    );
    const [{ count }] = result;
    return Number(count) > 0;
  }

  async up(queryRunner) {
    const hasRemoved = await this.hasColumn(queryRunner, 'purchase_invoices', 'removed');
    if (!hasRemoved) {
      await queryRunner.query(
        "ALTER TABLE `purchase_invoices` ADD COLUMN `removed` tinyint(1) NOT NULL DEFAULT 0 AFTER `id`"
      );
    }
  }

  async down(queryRunner) {
    const hasRemoved = await this.hasColumn(queryRunner, 'purchase_invoices', 'removed');
    if (hasRemoved) {
      await queryRunner.query("ALTER TABLE `purchase_invoices` DROP COLUMN `removed`");
    }
  }
}

module.exports = AddRemovedToPurchaseInvoices1717000000000;
