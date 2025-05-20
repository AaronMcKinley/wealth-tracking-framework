import axios from 'axios';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const API_KEY = process.env.FINNHUB_API_KEY!;
const SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];

async function fetchStocks() {
  const results: any[] = [];

  for (const symbol of SYMBOLS) {
    try {
      const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
        params: {
          symbol,
          token: API_KEY,
        },
      });

      const now = new Date();
      results.push({ symbol, ...data, date: now });

      await pool.query(`
        INSERT INTO stocks (symbol, name, open, high, low, close, volume, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (symbol) DO UPDATE SET
          open = EXCLUDED.open,
          high = EXCLUDED.high,
          low = EXCLUDED.low,
          close = EXCLUDED.close,
          volume = EXCLUDED.volume,
          date = EXCLUDED.date;
      `, [
        symbol,
        symbol,
        data.o,
        data.h,
        data.l,
        data.c,
        data.v || 0,
        now,
      ]);

    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error.message);
    }
  }

  fs.writeFileSync('wtfStocks.json', JSON.stringify(results, null, 2));
  console.log('Stock data saved and DB updated.');
  await pool.end();
}

fetchStocks().catch(console.error);
