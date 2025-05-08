exports.up = async (pgm) => {
  // Insert dummy user
  await pgm.sql(`
    INSERT INTO users (email, name)
    VALUES ('testuser@example.com', 'Test User');
  `);

  // Use subquery to get the inserted user_id
  await pgm.sql(`
    INSERT INTO investments (user_id, type, amount, buy_price, current_value, interest, currency)
    SELECT id, 'crypto', 1.0, 25000.00, 62000.00, 0, 'EUR'
    FROM users WHERE email = 'testuser@example.com';
  `);

  await pgm.sql(`
    INSERT INTO investments (user_id, type, amount, buy_price, current_value, interest, currency)
    SELECT id, 'stock', 3.0, 110.00, 180.00, 0, 'EUR'
    FROM users WHERE email = 'testuser@example.com';
  `);
};

exports.down = async (pgm) => {
  await pgm.sql(`DELETE FROM investments WHERE user_id IN (
    SELECT id FROM users WHERE email = 'testuser@example.com'
  );`);
  await pgm.sql(`DELETE FROM users WHERE email = 'testuser@example.com';`);
};
