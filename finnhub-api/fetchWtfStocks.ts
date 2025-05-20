import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import ALL_SYMBOLS from './stocksList';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.FINNHUB_API_KEY;
if (!API_KEY) {
  console.error('FINNHUB_API_KEY not found in environment. Check your .env file.');
  process.exit(1);
}

const OUTPUT_FILE = path.resolve(__dirname, './data/allAssets.json');

async function fetchAll() {
  const results: any[] = [];

  for (const { symbol, type } of ALL_SYMBOLS) {
    try {
      const response = await axios.get('https://finnhub.io/api/v1/quote', {
        params: { symbol, token: API_KEY }
      });

      const data = response.data;
      results.push({
        symbol,
        type,
        open: data.o,
        high: data.h,
        low: data.l,
        current_price: data.c,
        previous_close: data.pc,
        timestamp: new Date().toISOString()
      });

      console.log(`Successfully fetched quote for ${symbol}`);
    } catch (error: any) {
      console.error(`Error fetching ${symbol}:`, error.response?.status || error.message);
    }

    await new Promise(r => setTimeout(r, 150));
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} assets to ${OUTPUT_FILE}`);
}

fetchAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
