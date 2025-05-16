exports.up = (pgm) => {
  pgm.createTable('cryptocurrencies', {
    id: { type: 'text', primaryKey: true },
    symbol: { type: 'varchar(20)', notNull: true },
    name: { type: 'varchar(100)', notNull: true },
    current_price: { type: 'numeric', notNull: true },
    market_cap: { type: 'bigint' },
    price_change_percentage_24h: { type: 'numeric' },
    image: { type: 'text' },
    last_updated: { type: 'timestamp' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('cryptocurrencies');
};
