class EnsureExpenseColumns1719000000001 {
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
    const tableName = 'expenses';

    await this.addColumnIfMissing(queryRunner, tableName, 'removed', '`removed` tinyint(1) NOT NULL DEFAULT 0', 'AFTER `notes`');

    await this.addColumnIfMissing(queryRunner, tableName, 'createdBy', '`createdBy` int NULL', 'AFTER `removed`');

    const renamedCategory = await this.renameColumnIfExists(queryRunner, tableName, 'categoryId', '`category` int NULL');
    if (!renamedCategory) {
      await this.addColumnIfMissing(queryRunner, tableName, 'category', '`category` int NULL', 'AFTER `notes`');
    }

    const renamedSupplier = await this.renameColumnIfExists(queryRunner, tableName, 'supplierId', '`supplier` int NULL');
    if (!renamedSupplier) {
      await this.addColumnIfMissing(queryRunner, tableName, 'supplier', '`supplier` int NULL', 'AFTER `category`');
    }

    await this.addColumnIfMissing(queryRunner, tableName, 'reference', '`reference` varchar(191) NULL', 'AFTER `description`');

  }

  async down(queryRunner) {
    const tableName = 'expenses';

    const hasCategoryId = await this.hasColumn(queryRunner, tableName, 'categoryId');
    if (!hasCategoryId) {
      const renamedBack = await this.renameColumnIfExists(queryRunner, tableName, 'category', '`categoryId` int NULL');
      if (!renamedBack) {
        await this.addColumnIfMissing(queryRunner, tableName, 'categoryId', '`categoryId` int NULL', 'AFTER `notes`');
      }
    }

    const hasSupplierId = await this.hasColumn(queryRunner, tableName, 'supplierId');
    if (!hasSupplierId) {
      const renamedBack = await this.renameColumnIfExists(queryRunner, tableName, 'supplier', '`supplierId` int NULL');
      if (!renamedBack) {
        await this.addColumnIfMissing(queryRunner, tableName, 'supplierId', '`supplierId` int NULL', 'AFTER `categoryId`');
      }
    }

    const dropColumns = ['createdBy', 'reference'];
    for (const column of dropColumns) {
      const hasColumn = await this.hasColumn(queryRunner, tableName, column);
      if (hasColumn) {
        await queryRunner.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${column}\``);
      }
    }
  }
}

module.exports = EnsureExpenseColumns1719000000001;
