require('dotenv').config();

module.exports = {
  direction: 'up',
  migrationsTable: 'pgmigrations',
  migrationsDirectory: './migrations',
  databaseUrl: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
  },
};
