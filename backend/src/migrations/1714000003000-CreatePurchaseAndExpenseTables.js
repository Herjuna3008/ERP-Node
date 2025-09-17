const { Table, TableForeignKey } = require('typeorm');

module.exports = class CreatePurchaseAndExpenseTables1714000003000 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'purchase_invoices',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'removed', type: 'boolean', default: false },
          { name: 'createdBy', type: 'int', isNullable: true },
          { name: 'number', type: 'int', isNullable: true },
          { name: 'year', type: 'int', isNullable: true },
          { name: 'reference', type: 'varchar', length: '255', isNullable: true },
          { name: 'date', type: 'date' },
          { name: 'dueDate', type: 'date', isNullable: true },
          { name: 'supplier', type: 'int', isNullable: true },
          { name: 'taxRate', type: 'decimal', precision: 5, scale: 2, default: '0.00' },
          { name: 'subTotal', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'taxTotal', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'discount', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'total', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'status', type: 'varchar', length: '50', default: "'draft'" },
          { name: 'paymentStatus', type: 'varchar', length: '50', default: "'UNPAID'" },
          { name: 'currency', type: 'varchar', length: '10', default: "'NA'" },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'files', type: 'text', isNullable: true },
          { name: 'created', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          {
            name: 'updated',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'purchase_invoices',
      new TableForeignKey({
        columnNames: ['supplier'],
        referencedTableName: 'suppliers',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'purchase_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'invoice', type: 'int' },
          { name: 'product', type: 'int', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'quantity', type: 'decimal', precision: 12, scale: 4, default: '0' },
          { name: 'costPrice', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'discountType', type: 'varchar', length: '50', default: "'fixed'" },
          { name: 'discountValue', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'total', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'created', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('purchase_items', [
      new TableForeignKey({
        columnNames: ['invoice'],
        referencedTableName: 'purchase_invoices',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['product'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'stock_ledgers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'product', type: 'int' },
          { name: 'purchaseInvoice', type: 'int', isNullable: true },
          { name: 'purchaseItem', type: 'int', isNullable: true },
          { name: 'referenceType', type: 'varchar', length: '100' },
          { name: 'referenceId', type: 'int', isNullable: true },
          {
            name: 'movementType',
            type: 'enum',
            enum: ['IN', 'OUT'],
            default: "'IN'",
          },
          { name: 'quantity', type: 'decimal', precision: 12, scale: 4 },
          { name: 'unitCost', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'totalCost', type: 'decimal', precision: 14, scale: 2, isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('stock_ledgers', [
      new TableForeignKey({
        columnNames: ['product'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['purchaseInvoice'],
        referencedTableName: 'purchase_invoices',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['purchaseItem'],
        referencedTableName: 'purchase_items',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'expense_categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'removed', type: 'boolean', default: false },
          { name: 'created', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          {
            name: 'updated',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'expenses',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'amount', type: 'decimal', precision: 12, scale: 2, default: '0.00' },
          { name: 'expenseDate', type: 'date' },
          { name: 'reference', type: 'varchar', length: '255', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'removed', type: 'boolean', default: false },
          { name: 'supplier', type: 'int', isNullable: true },
          { name: 'category', type: 'int', isNullable: true },
          { name: 'purchaseInvoice', type: 'int', isNullable: true },
          { name: 'created', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          {
            name: 'updated',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('expenses', [
      new TableForeignKey({
        columnNames: ['supplier'],
        referencedTableName: 'suppliers',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['category'],
        referencedTableName: 'expense_categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['purchaseInvoice'],
        referencedTableName: 'purchase_invoices',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);
  }

  async down(queryRunner) {
    const expensesTable = await queryRunner.getTable('expenses');
    if (expensesTable) {
      for (const foreignKey of expensesTable.foreignKeys) {
        await queryRunner.dropForeignKey('expenses', foreignKey);
      }
    }
    await queryRunner.dropTable('expenses');

    await queryRunner.dropTable('expense_categories');

    const stockLedgerTable = await queryRunner.getTable('stock_ledgers');
    if (stockLedgerTable) {
      for (const foreignKey of stockLedgerTable.foreignKeys) {
        await queryRunner.dropForeignKey('stock_ledgers', foreignKey);
      }
    }
    await queryRunner.dropTable('stock_ledgers');

    const purchaseItemsTable = await queryRunner.getTable('purchase_items');
    if (purchaseItemsTable) {
      for (const foreignKey of purchaseItemsTable.foreignKeys) {
        await queryRunner.dropForeignKey('purchase_items', foreignKey);
      }
    }
    await queryRunner.dropTable('purchase_items');

    const purchaseInvoicesTable = await queryRunner.getTable('purchase_invoices');
    if (purchaseInvoicesTable) {
      for (const foreignKey of purchaseInvoicesTable.foreignKeys) {
        await queryRunner.dropForeignKey('purchase_invoices', foreignKey);
      }
    }
    await queryRunner.dropTable('purchase_invoices');
  }
};
