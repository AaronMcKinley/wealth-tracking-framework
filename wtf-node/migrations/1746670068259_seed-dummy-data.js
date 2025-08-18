exports.up = async (pgm) => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('testpass', 10);

  // Insert user
  await pgm.sql(`
    INSERT INTO users (email, name, password)
    VALUES ('test@email.com', 'Demo User', '${hashedPassword}');
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
