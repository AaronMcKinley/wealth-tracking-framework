exports.up = (pgm) => {
  // Create the users table
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(100)', notNull: true, unique: true },
    name: { type: 'varchar(100)' },
    password: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Create the investments table
  pgm.createTable('investments', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    name: { type: 'varchar(100)', notNull: true },        // e.g., Bitcoin, Tesla, ETH
    type: { type: 'varchar(50)', notNull: true },         // e.g., 'crypto', 'stock', 'real_estate'
    sub_type: { type: 'varchar(50)' },                    // e.g., 'dividend', 'REIT', etc.
    amount: { type: 'numeric', notNull: true },
    buy_price: { type: 'numeric', notNull: true },
    current_value: { type: 'numeric', notNull: true },
    interest_rate: { type: 'numeric' },                   // applicable to interest-bearing assets
    currency: { type: 'varchar(10)', default: 'EUR' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('investments');
  pgm.dropTable('users');
};
