exports.up = (pgm) => {
  pgm.createTable('cryptocurrencies', {
    id: { type: 'text', primaryKey: true },
    ticker: { type: 'varchar(20)', notNull: true, unique: true },
    name: { type: 'varchar(100)', notNull: true },
    image: { type: 'text' },
    current_price: { type: 'numeric', notNull: true },
    market_cap: { type: 'bigint' },
    market_cap_rank: { type: 'integer' },
    price_change_24h: { type: 'numeric' },
    price_change_percentage_24h: { type: 'numeric' },
    total_supply: { type: 'numeric' },
    ath: { type: 'numeric' },
    atl: { type: 'numeric' },
    last_updated: { type: 'timestamp' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('cryptocurrencies');
};
