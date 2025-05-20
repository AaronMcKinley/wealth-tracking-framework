import axios from 'axios';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import ALL_SYMBOLS from './stocksList';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.FINNHUB_API_KEY;
if (!API_KEY) {
  console.error('FINNHUB_API_KEY not found in environment. Check your .env file.');
  process.exit(1);
}

const pool = new Pool();

interface Asset {
  ticker: string;
  type: string;
  open?: number;
  high?: number;
  low?: number;
  current_price: number;
  previous_close?: number;
  timestamp?: string;
}

async function fetchAndUpsertAssets() {
  console.log('Fetching Finnhub data and updating DB...');

  try {
    for (const { ticker, type } of ALL_SYMBOLS) {
      try {
        const response = await axios.get('https://finnhub.io/api/v1/quote', {
          params: { symbol: ticker, token: API_KEY },
        });
        const data = response.data;

        const asset: Asset = {
          ticker,
          type,
          open: data.o,
          high: data.h,
          low: data.l,
          current_price: data.c,
          previous_close: data.pc,
          timestamp: new Date().toISOString(),
        };

        await pool.query(
          `
          INSERT INTO market_assets (
            ticker, type, open, high, low, current_price, previous_close, timestamp
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          ON CONFLICT (ticker) DO UPDATE SET
            type = EXCLUDED.type,
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            current_price = EXCLUDED.current_price,
            previous_close = EXCLUDED.previous_close,
            timestamp = EXCLUDED.timestamp;
          `,
          [
            asset.ticker,
            asset.type,
            asset.open,
            asset.high,
            asset.low,
            asset.current_price,
            asset.previous_close,
            asset.timestamp,
          ]
        );

        console.log(`Upserted ${ticker} successfully.`);
      } catch (innerErr: any) {
        console.error(`Error fetching/updating ${ticker}:`, innerErr.message || innerErr);
      }

      await new Promise((r) => setTimeout(r, 150)); // Rate limit delay
    }
  } catch (err: any) {
    console.error('Fatal error during fetch and DB update:', err);
  } finally {
    await pool.end();
  }
}

fetchAndUpsertAssets();
