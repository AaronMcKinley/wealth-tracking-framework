exports.up = (pgm) => {
  pgm.createTable('market_assets', {
    ticker: { type: 'text', primaryKey: true },
    type: { type: 'varchar(20)', notNull: true },
    name: { type: 'varchar(100)' },
    current_price: { type: 'numeric', notNull: true },
    open: { type: 'numeric' },
    high: { type: 'numeric' },
    low: { type: 'numeric' },
    previous_close: { type: 'numeric' },
    timestamp: { type: 'timestamp' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('market_assets');
};
