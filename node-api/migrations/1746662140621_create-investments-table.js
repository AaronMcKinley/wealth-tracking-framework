/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('investments', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    name: {
      type: 'text',
      notNull: true
    },
    type: {
      type: 'text',
      notNull: true
    },
    symbol: {
      type: 'text'
    },
    value: {
      type: 'numeric',
      notNull: true
    },
    currency: {
      type: 'text',
      default: 'EUR'
    },
    notes: {
      type: 'text'
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp')
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('investments');
};
