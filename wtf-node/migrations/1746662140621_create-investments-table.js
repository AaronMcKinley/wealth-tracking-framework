exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(100)', notNull: true, unique: true },
    name: { type: 'varchar(100)' },
    password: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('transactions', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    asset_ticker: { type: 'varchar(20)', notNull: true },
    transaction_type: { type: 'varchar(20)', notNull: true },
    quantity: { type: 'numeric', notNull: true },
    price_per_unit: { type: 'numeric', notNull: true },
    total_value: { type: 'numeric', notNull: true },
    fees: { type: 'numeric', default: 0 },
    realized_profit_loss: { type: 'numeric', notNull: false, default: 0 },
    transaction_date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('investments', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    asset_ticker: { type: 'varchar(20)', notNull: true },
    asset_name: { type: 'varchar(255)', notNull: false },
    type: { type: 'varchar(50)', notNull: false },
    total_quantity: { type: 'numeric', notNull: true, default: 0 },
    average_buy_price: { type: 'numeric', notNull: true, default: 0 },
    current_price: { type: 'numeric' },
    current_value: { type: 'numeric' },
    profit_loss: { type: 'numeric' },
    percent_change_24h: { type: 'numeric' },
    total_profit_loss: { type: 'numeric', notNull: true, default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('investments', 'unique_user_asset', {
    unique: ['user_id', 'asset_ticker'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('investments', 'unique_user_asset');
  pgm.dropTable('investments');
  pgm.dropTable('transactions');
  pgm.dropTable('users');
};
