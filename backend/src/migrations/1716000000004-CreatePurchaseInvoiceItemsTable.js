class CreatePurchaseInvoiceItemsTable1716000000004 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`purchase_invoice_items\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`description\` text NULL,
        \`quantity\` float NOT NULL DEFAULT 0,
        \`unitPrice\` float NOT NULL DEFAULT 0,
        \`discountValue\` float NOT NULL DEFAULT 0,
        \`discountType\` varchar(20) NOT NULL DEFAULT 'amount',
        \`total\` float NOT NULL DEFAULT 0,
        \`removed\` tinyint(1) NOT NULL DEFAULT 0,
        \`created\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`invoice\` int NOT NULL,
        \`product\` int NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_purchase_invoice_items_invoice\` (\`invoice\`),
        KEY \`IDX_purchase_invoice_items_product\` (\`product\`),
        CONSTRAINT \`FK_purchase_invoice_items_invoice\` FOREIGN KEY (\`invoice\`) REFERENCES \`purchase_invoices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_purchase_invoice_items_product\` FOREIGN KEY (\`product\`) REFERENCES \`products\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS `purchase_invoice_items`');
  }
}

module.exports = CreatePurchaseInvoiceItemsTable1716000000004;
