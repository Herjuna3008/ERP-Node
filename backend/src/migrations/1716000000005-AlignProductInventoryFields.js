class AlignProductInventoryFields1716000000005 {
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

  async addNumericColumnIfMissing(queryRunner, tableName, columnName, definitionSql, migrateFromColumn = null) {
    if (!(await this.columnExists(queryRunner, tableName, columnName))) {
      await queryRunner.query(`ALTER TABLE \`${tableName}\` ADD ${definitionSql}`);
      if (migrateFromColumn && (await this.columnExists(queryRunner, tableName, migrateFromColumn))) {
        await queryRunner.query(
          `UPDATE \`${tableName}\` SET \`${columnName}\` = COALESCE(\`${migrateFromColumn}\`, 0)`
        );
      }
    }
  }

  async dropColumnIfPresent(queryRunner, tableName, columnName) {
    if (await this.columnExists(queryRunner, tableName, columnName)) {
      await queryRunner.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
    }
  }

  async up(queryRunner) {
    const tableName = 'products';

    await this.addNumericColumnIfMissing(
      queryRunner,
      tableName,
      'stockQuantity',
      '`stockQuantity` float NOT NULL DEFAULT 0',
      'stock'
    );

    await this.addNumericColumnIfMissing(
      queryRunner,
      tableName,
      'lastCostPrice',
      '`lastCostPrice` float NOT NULL DEFAULT 0',
      'costPrice'
    );

    await this.addNumericColumnIfMissing(
      queryRunner,
      tableName,
      'lastSellPrice',
      '`lastSellPrice` float NOT NULL DEFAULT 0',
      'sellPrice'
    );

    await this.dropColumnIfPresent(queryRunner, tableName, 'stock');
    await this.dropColumnIfPresent(queryRunner, tableName, 'costPrice');
    await this.dropColumnIfPresent(queryRunner, tableName, 'sellPrice');
  }

  async down(queryRunner) {
    const tableName = 'products';

    await this.addNumericColumnIfMissing(queryRunner, tableName, 'stock', '`stock` float NOT NULL DEFAULT 0', 'stockQuantity');
    await this.addNumericColumnIfMissing(queryRunner, tableName, 'costPrice', '`costPrice` float NOT NULL DEFAULT 0', 'lastCostPrice');
    await this.addNumericColumnIfMissing(queryRunner, tableName, 'sellPrice', '`sellPrice` float NOT NULL DEFAULT 0', 'lastSellPrice');

    await this.dropColumnIfPresent(queryRunner, tableName, 'stockQuantity');
    await this.dropColumnIfPresent(queryRunner, tableName, 'lastCostPrice');
    await this.dropColumnIfPresent(queryRunner, tableName, 'lastSellPrice');
  }
}

module.exports = AlignProductInventoryFields1716000000005;
