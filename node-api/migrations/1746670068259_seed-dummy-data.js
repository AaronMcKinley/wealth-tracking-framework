exports.up = async (pgm) => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('testpass', 10); // Updated password

  await pgm.sql(`
    INSERT INTO users (email, name, password)
    VALUES ('test@email.com', 'Demo User', '${hashedPassword}');
  `);

  await pgm.sql(`
    INSERT INTO investments (user_id, type, amount, buy_price, current_value, interest, currency)
    SELECT id, 'crypto', 1.0, 25000.00, 62000.00, 0, 'EUR'
    FROM users WHERE email = 'test@email.com';
  `);

  await pgm.sql(`
    INSERT INTO investments (user_id, type, amount, buy_price, current_value, interest, currency)
    SELECT id, 'stock', 3.0, 110.00, 180.00, 0, 'EUR'
    FROM users WHERE email = 'test@email.com';
  `);
};

exports.down = async (pgm) => {
  await pgm.sql(`
    DELETE FROM investments WHERE user_id IN (
      SELECT id FROM users WHERE email = 'test@email.com'
    );
  `);

  await pgm.sql(`
    DELETE FROM users WHERE email = 'test@email.com';
  `);
};
