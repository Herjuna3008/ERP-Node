class EnsureStockLedgerColumns1719000000000 {
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

  async addColumnIfMissing(queryRunner, tableName, columnName, definitionSql, updateSql = null) {
    if (!(await this.columnExists(queryRunner, tableName, columnName))) {
      await queryRunner.query(`ALTER TABLE \`${tableName}\` ADD ${definitionSql}`);
      if (updateSql) {
        await queryRunner.query(updateSql);
      }
    }
  }

  async dropColumnIfPresent(queryRunner, tableName, columnName) {
    if (await this.columnExists(queryRunner, tableName, columnName)) {
      await queryRunner.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
    }
  }

  async up(queryRunner) {
    const tableName = 'stock_ledger';

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'entryType',
      "`entryType` varchar(10) NOT NULL DEFAULT ''"
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'quantity',
      '`quantity` float NOT NULL DEFAULT 0'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'costPrice',
      '`costPrice` float NOT NULL DEFAULT 0'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'sellPrice',
      '`sellPrice` float NOT NULL DEFAULT 0'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'sourceType',
      "`sourceType` varchar(50) NOT NULL DEFAULT ''"
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'sourceId',
      '`sourceId` int NOT NULL DEFAULT 0'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'sourceItemId',
      '`sourceItemId` int NULL'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'notes',
      '`notes` text NULL'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'created',
      "`created` timestamp NOT NULL DEFAULT '2000-01-01 00:00:00'"
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'product',
      '`product` int NOT NULL'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'invoiceId',
      '`invoiceId` int NULL'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'purchaseInvoiceId',
      '`purchaseInvoiceId` int NULL'
    );
  }

  async down(queryRunner) {
    const tableName = 'stock_ledger';

    await this.dropColumnIfPresent(queryRunner, tableName, 'purchaseInvoiceId');
    await this.dropColumnIfPresent(queryRunner, tableName, 'invoiceId');
    await this.dropColumnIfPresent(queryRunner, tableName, 'product');
    await this.dropColumnIfPresent(queryRunner, tableName, 'created');
    await this.dropColumnIfPresent(queryRunner, tableName, 'notes');
    await this.dropColumnIfPresent(queryRunner, tableName, 'sourceItemId');
    await this.dropColumnIfPresent(queryRunner, tableName, 'sourceId');
    await this.dropColumnIfPresent(queryRunner, tableName, 'sourceType');
    await this.dropColumnIfPresent(queryRunner, tableName, 'sellPrice');
    await this.dropColumnIfPresent(queryRunner, tableName, 'costPrice');
    await this.dropColumnIfPresent(queryRunner, tableName, 'quantity');
    await this.dropColumnIfPresent(queryRunner, tableName, 'entryType');
  }
}

module.exports = EnsureStockLedgerColumns1719000000000;
