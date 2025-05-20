exports.up = (pgm) => {
  pgm.createTable('stocks_and_funds', {
    name: { type: 'varchar(100)', notNull: true },
    ticker: { type: 'text', primaryKey: true },
    type: { type: 'varchar(20)', notNull: true },
    current_price: { type: 'numeric', notNull: true },
    open: { type: 'numeric' },
    high: { type: 'numeric' },
    low: { type: 'numeric' },
    previous_close: { type: 'numeric' },
    timestamp: { type: 'timestamp' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('stocks_and_funds');
};
