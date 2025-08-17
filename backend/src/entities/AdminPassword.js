const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'AdminPassword',
  tableName: 'admin_passwords',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    removed: { type: 'boolean', default: false },
    password: { type: 'varchar', length: 255 },
    salt: { type: 'varchar', length: 255 },
    emailToken: { type: 'varchar', nullable: true },
    resetToken: { type: 'varchar', nullable: true },
    emailVerified: { type: 'boolean', default: false },
    authType: { type: 'varchar', default: 'email' },
    loggedSessions: { type: 'simple-json', default: () => "'[]'" },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    user: {
      target: 'Admin',
      type: 'many-to-one',
      joinColumn: true,
      nullable: false,
      eager: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  },
});
