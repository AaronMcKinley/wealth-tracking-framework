exports.up = (pgm) => {
  // Create the users table
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(100)', notNull: true, unique: true },
    name: { type: 'varchar(100)' },
    password: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Create the investments table with only name, amount, and buy_price NOT NULL
  pgm.createTable('investments', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    name: { type: 'varchar(100)', notNull: true },
    ticker: { type: 'varchar(20)' }, // nullable
    type: { type: 'varchar(50)' }, // nullable now
    amount: { type: 'numeric', notNull: true },
    buy_price: { type: 'numeric', notNull: true },
    current_value: { type: 'numeric' }, // nullable now
    interest_rate: { type: 'numeric' }, // nullable
    profit_loss: { type: 'numeric' }, // nullable
    percent_change_24h: { type: 'numeric' }, // nullable
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('investments');
  pgm.dropTable('users');
};
