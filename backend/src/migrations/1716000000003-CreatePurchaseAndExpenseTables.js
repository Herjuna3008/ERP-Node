class CreatePurchaseAndExpenseTables1716000000003 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE \`purchase_invoices\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`referenceNumber\` varchar(100) NOT NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'draft',
        \`issueDate\` date NOT NULL,
        \`dueDate\` date NULL,
        \`notes\` text NULL,
        \`subTotal\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`taxTotal\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`total\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`supplierId\` int NULL,
        \`created\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_purchase_invoices_supplier\` (\`supplierId\`),
        CONSTRAINT \`FK_purchase_invoices_supplier\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`purchase_items\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`description\` text NULL,
        \`quantity\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`costPrice\` decimal(10,2) NOT NULL DEFAULT '0.00',
        \`total\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`purchaseInvoiceId\` int NOT NULL,
        \`productId\` int NULL,
        \`created\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_purchase_items_invoice\` (\`purchaseInvoiceId\`),
        KEY \`IDX_purchase_items_product\` (\`productId\`),
        CONSTRAINT \`FK_purchase_items_invoice\` FOREIGN KEY (\`purchaseInvoiceId\`) REFERENCES \`purchase_invoices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_purchase_items_product\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_ledger\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`referenceType\` varchar(100) NOT NULL,
        \`referenceNumber\` varchar(100) NULL,
        \`movementType\` varchar(50) NOT NULL,
        \`quantity\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`balance\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`notes\` text NULL,
        \`occurredAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`productId\` int NOT NULL,
        \`invoiceId\` int NULL,
        \`purchaseInvoiceId\` int NULL,
        \`created\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_stock_ledger_product\` (\`productId\`),
        KEY \`IDX_stock_ledger_invoice\` (\`invoiceId\`),
        KEY \`IDX_stock_ledger_purchase_invoice\` (\`purchaseInvoiceId\`),
        CONSTRAINT \`FK_stock_ledger_product\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_stock_ledger_invoice\` FOREIGN KEY (\`invoiceId\`) REFERENCES \`invoices\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT \`FK_stock_ledger_purchase_invoice\` FOREIGN KEY (\`purchaseInvoiceId\`) REFERENCES \`purchase_invoices\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`expense_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(150) NOT NULL,
        \`description\` text NULL,
        \`created\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`expenses\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`description\` text NULL,
        \`amount\` decimal(12,2) NOT NULL DEFAULT '0.00',
        \`expenseDate\` date NOT NULL,
        \`notes\` text NULL,
        \`categoryId\` int NULL,
        \`supplierId\` int NULL,
        \`invoiceId\` int NULL,
        \`created\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_expenses_category\` (\`categoryId\`),
        KEY \`IDX_expenses_supplier\` (\`supplierId\`),
        KEY \`IDX_expenses_invoice\` (\`invoiceId\`),
        CONSTRAINT \`FK_expenses_category\` FOREIGN KEY (\`categoryId\`) REFERENCES \`expense_categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT \`FK_expenses_supplier\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT \`FK_expenses_invoice\` FOREIGN KEY (\`invoiceId\`) REFERENCES \`invoices\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE `expenses`');
    await queryRunner.query('DROP TABLE `expense_categories`');
    await queryRunner.query('DROP TABLE `stock_ledger`');
    await queryRunner.query('DROP TABLE `purchase_items`');
    await queryRunner.query('DROP TABLE `purchase_invoices`');
  }
}

module.exports = CreatePurchaseAndExpenseTables1716000000003;
