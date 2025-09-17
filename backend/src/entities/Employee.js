const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Employee',
  tableName: 'employees',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar', length: 255 },
    surname: { type: 'varchar', length: 255 },
    birthday: { type: 'date', nullable: true },
    birthplace: { type: 'varchar', length: 255, nullable: true },
    gender: { type: 'enum', enum: ['men', 'women'], nullable: true },
    email: { type: 'varchar', length: 255, nullable: true },
    phone: { type: 'varchar', length: 255, nullable: true },
    department: { type: 'varchar', length: 255, nullable: true },
    position: { type: 'varchar', length: 255, nullable: true },
    address: { type: 'varchar', length: 255, nullable: true },
    state: { type: 'varchar', length: 255, nullable: true },
    salary: { type: 'float', default: 0 },
    removed: { type: 'boolean', default: false },
    created: { type: 'timestamp', createDate: true, default: () => 'CURRENT_TIMESTAMP' },
    updated: { type: 'timestamp', updateDate: true, default: () => 'CURRENT_TIMESTAMP' },
  },
});
