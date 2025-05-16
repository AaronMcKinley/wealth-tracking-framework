exports.up = async (pgm) => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('testpass', 10); // Updated password

  await pgm.sql(`
    INSERT INTO users (email, name, password)
    VALUES ('test@email.com', 'Demo User', '${hashedPassword}');
  `);

  // Add crypto investment (e.g., Bitcoin)
  await pgm.sql(`
    INSERT INTO investments (
      user_id, name, type, sub_type, amount, buy_price, current_value, interest_rate, currency
    )
    SELECT id, 'Bitcoin', 'crypto', null, 1.0, 25000.00, 62000.00, null, 'EUR'
    FROM users WHERE email = 'test@email.com';
  `);

  // Add stock investment (e.g., Apple stock with dividends)
  await pgm.sql(`
    INSERT INTO investments (
      user_id, name, type, sub_type, amount, buy_price, current_value, interest_rate, currency
    )
    SELECT id, 'Apple', 'stock', 'dividend', 3.0, 110.00, 180.00, null, 'EUR'
    FROM users WHERE email = 'test@email.com';
  `);

  // Add high-yield savings account
  await pgm.sql(`
    INSERT INTO investments (
      user_id, name, type, sub_type, amount, buy_price, current_value, interest_rate, currency
    )
    SELECT id, 'High Yield Savings', 'savings', 'fixed_deposit', 10000.00, 10000.00, 10250.00, 2.5, 'EUR'
    FROM users WHERE email = 'test@email.com';
  `);

  // Add property investment
  await pgm.sql(`
    INSERT INTO investments (
      user_id, name, type, sub_type, amount, buy_price, current_value, interest_rate, currency
    )
    SELECT id, 'Rental Property - Berlin', 'real_estate', 'rental', 1.0, 250000.00, 300000.00, null, 'EUR'
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
