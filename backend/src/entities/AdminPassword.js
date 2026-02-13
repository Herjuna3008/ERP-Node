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
    // MySQL 5.5 does not allow defaults on TEXT/BLOB columns.
    // `simple-json` is persisted as TEXT, so keep it nullable and initialize in app code.
    loggedSessions: { type: 'simple-json', nullable: true },
    created: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
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
