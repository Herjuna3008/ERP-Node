class AddRemovedToExpenses1716000000004 {
  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE \`expense_categories\`
      ADD COLUMN \`removed\` tinyint(1) NOT NULL DEFAULT 0 AFTER \`description\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`expenses\`
      ADD COLUMN \`removed\` tinyint(1) NOT NULL DEFAULT 0 AFTER \`notes\`
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE \`expenses\`
      DROP COLUMN \`removed\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`expense_categories\`
      DROP COLUMN \`removed\`
    `);
  }
}

module.exports = AddRemovedToExpenses1716000000004;
