class AddReferenceToExpenses1718000000001 {
  async up(queryRunner) {
    const hasReferenceColumn = await queryRunner.hasColumn('expenses', 'reference');
    if (!hasReferenceColumn) {
      await queryRunner.query(`
        ALTER TABLE \`expenses\`
        ADD COLUMN \`reference\` varchar(191) NULL AFTER \`description\`
      `);
    }
  }

  async down(queryRunner) {
    const hasReferenceColumn = await queryRunner.hasColumn('expenses', 'reference');
    if (hasReferenceColumn) {
      await queryRunner.query(`
        ALTER TABLE \`expenses\`
        DROP COLUMN \`reference\`
      `);
    }
  }
}

module.exports = AddReferenceToExpenses1718000000001;
