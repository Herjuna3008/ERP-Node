class EnhanceInvoiceDiscounts1716000000002 {
  async columnExists(queryRunner, tableName, columnName) {
    const result = await queryRunner.query(
      'SELECT COUNT(*) AS columnCount FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
      [tableName, columnName]
    );

    const countValue =
      result?.[0]?.columnCount ??
      result?.[0]?.COLUMNCOUNT ??
      (result?.[0] ? Object.values(result[0])[0] : 0);

    const normalizedValue = countValue !== undefined ? String(countValue) : '0';
    const columnCount = Number.parseInt(normalizedValue, 10);
    return Number.isFinite(columnCount) && columnCount > 0;
  }

  async addColumnIfMissing(queryRunner, tableName, columnName, definitionSql) {
    if (!(await this.columnExists(queryRunner, tableName, columnName))) {
      await queryRunner.query(`ALTER TABLE \`${tableName}\` ADD ${definitionSql}`);
    }
  }

  async dropColumnIfPresent(queryRunner, tableName, columnName) {
    if (await this.columnExists(queryRunner, tableName, columnName)) {
      await queryRunner.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
    }
  }

  async up(queryRunner) {
    await this.addColumnIfMissing(
      queryRunner,
      'invoices',
      'globalDiscountType',
      "`globalDiscountType` varchar(50) NOT NULL DEFAULT 'NONE'"
    );
    await this.addColumnIfMissing(
      queryRunner,
      'invoices',
      'globalDiscountValue',
      "`globalDiscountValue` decimal(10,2) NOT NULL DEFAULT '0.00'"
    );
    await this.addColumnIfMissing(
      queryRunner,
      'invoice_items',
      'discountType',
      "`discountType` varchar(50) NOT NULL DEFAULT 'NONE'"
    );
    await this.addColumnIfMissing(
      queryRunner,
      'invoice_items',
      'discountValue',
      "`discountValue` decimal(10,2) NOT NULL DEFAULT '0.00'"
    );
    await this.addColumnIfMissing(
      queryRunner,
      'invoice_items',
      'sellPrice',
      "`sellPrice` decimal(10,2) NOT NULL DEFAULT '0.00'"
    );
  }

  async down(queryRunner) {
    await this.dropColumnIfPresent(queryRunner, 'invoice_items', 'sellPrice');
    await this.dropColumnIfPresent(queryRunner, 'invoice_items', 'discountValue');
    await this.dropColumnIfPresent(queryRunner, 'invoice_items', 'discountType');
    await this.dropColumnIfPresent(queryRunner, 'invoices', 'globalDiscountValue');
    await this.dropColumnIfPresent(queryRunner, 'invoices', 'globalDiscountType');
  }
}

module.exports = EnhanceInvoiceDiscounts1716000000002;
