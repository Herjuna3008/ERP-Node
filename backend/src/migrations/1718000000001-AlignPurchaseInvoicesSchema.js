class AlignPurchaseInvoicesSchema1718000000001 {
  async hasColumn(queryRunner, tableName, columnName) {
    const result = await queryRunner.query(
      `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, columnName]
    );
    const [{ count }] = result;
    return Number(count) > 0;
  }

  async renameColumnIfExists(queryRunner, tableName, from, toDefinition) {
    const hasSource = await this.hasColumn(queryRunner, tableName, from);
    if (!hasSource) return false;
    await queryRunner.query(`ALTER TABLE \`${tableName}\` CHANGE COLUMN \`${from}\` ${toDefinition}`);
    return true;
  }

  async addColumnIfMissing(queryRunner, tableName, columnName, definition, positionClause = '') {
    const hasColumn = await this.hasColumn(queryRunner, tableName, columnName);
    if (hasColumn) return false;
    await queryRunner.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition} ${positionClause}`.trim());
    return true;
  }

  async up(queryRunner) {
    const tableName = 'purchase_invoices';

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'createdBy',
      '`createdBy` int NULL',
      'AFTER `removed`'
    );

    const numberRenamed = await this.renameColumnIfExists(
      queryRunner,
      tableName,
      'referenceNumber',
      '`number` varchar(191) NOT NULL'
    );
    if (!numberRenamed) {
      await this.addColumnIfMissing(
        queryRunner,
        tableName,
        'number',
        '`number` varchar(191) NOT NULL',
        'AFTER `createdBy`'
      );
    }

    const dateRenamed = await this.renameColumnIfExists(
      queryRunner,
      tableName,
      'issueDate',
      '`date` date NOT NULL'
    );
    if (!dateRenamed) {
      await this.addColumnIfMissing(queryRunner, tableName, 'date', '`date` date NOT NULL', 'AFTER `status`');
    }

    await this.renameColumnIfExists(queryRunner, tableName, 'supplierId', '`supplier` int NULL');

    await this.addColumnIfMissing(queryRunner, tableName, 'year', '`year` int NULL', 'AFTER `number`');

    await this.addColumnIfMissing(queryRunner, tableName, 'taxRate', '`taxRate` float NOT NULL DEFAULT 0', 'AFTER `dueDate`');

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'globalDiscountValue',
      '`globalDiscountValue` float NOT NULL DEFAULT 0',
      'AFTER `total`'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'globalDiscountType',
      "`globalDiscountType` varchar(20) NOT NULL DEFAULT 'amount'",
      'AFTER `globalDiscountValue`'
    );

    await this.addColumnIfMissing(
      queryRunner,
      tableName,
      'currency',
      "`currency` varchar(10) NOT NULL DEFAULT 'NA'",
      'AFTER `notes`'
    );

    const hasYear = await this.hasColumn(queryRunner, tableName, 'year');
    if (hasYear) {
      await queryRunner.query(
        "UPDATE `purchase_invoices` SET `year` = YEAR(`date`) WHERE `date` IS NOT NULL AND (`year` IS NULL OR `year` = 0)"
      );
    }
  }

  async down(queryRunner) {
    const tableName = 'purchase_invoices';

    const hasReference = await this.hasColumn(queryRunner, tableName, 'referenceNumber');
    if (!hasReference) {
      const renamedBack = await this.renameColumnIfExists(
        queryRunner,
        tableName,
        'number',
        '`referenceNumber` varchar(191) NOT NULL'
      );
      if (!renamedBack) {
        await this.addColumnIfMissing(
          queryRunner,
          tableName,
          'referenceNumber',
          '`referenceNumber` varchar(191) NULL',
          'AFTER `removed`'
        );
      }
    }

    const hasIssueDate = await this.hasColumn(queryRunner, tableName, 'issueDate');
    if (!hasIssueDate) {
      await this.renameColumnIfExists(queryRunner, tableName, 'date', '`issueDate` date NOT NULL');
    }

    const hasSupplierId = await this.hasColumn(queryRunner, tableName, 'supplierId');
    if (!hasSupplierId) {
      await this.renameColumnIfExists(queryRunner, tableName, 'supplier', '`supplierId` int NULL');
    }

    const dropColumns = ['createdBy', 'year', 'taxRate', 'globalDiscountValue', 'globalDiscountType', 'currency'];
    for (const column of dropColumns) {
      const hasColumn = await this.hasColumn(queryRunner, tableName, column);
      if (hasColumn) {
        await queryRunner.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${column}\``);
      }
    }
  }
}

module.exports = AlignPurchaseInvoicesSchema1718000000001;
