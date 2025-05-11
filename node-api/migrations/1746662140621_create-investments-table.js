exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(100)', notNull: true, unique: true },
    name: { type: 'varchar(100)' },
    password: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('investments', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    type: { type: 'varchar(50)', notNull: true },
    amount: { type: 'numeric', notNull: true },
    buy_price: { type: 'numeric', notNull: true },
    current_value: { type: 'numeric', notNull: true },
    interest: { type: 'numeric' },
    currency: { type: 'varchar(10)', default: 'EUR' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('investments');
  pgm.dropTable('users');
};
