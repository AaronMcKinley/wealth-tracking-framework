import axios from 'axios';
import { writeFileSync } from 'fs';
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
  name: string;
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

  const results: Asset[] = [];

  try {
    for (const { ticker, type } of ALL_SYMBOLS) {
      try {
        const quoteResponse = await axios.get('https://finnhub.io/api/v1/quote', {
          params: { symbol: ticker, token: API_KEY },
        });
        const quoteData = quoteResponse.data;

        const profileResponse = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
          params: { symbol: ticker, token: API_KEY },
        });
        const profileData = profileResponse.data;

        const asset: Asset = {
          name: profileData.name || 'Unknown',
          ticker,
          type,
          open: quoteData.o,
          high: quoteData.h,
          low: quoteData.l,
          current_price: quoteData.c,
          previous_close: quoteData.pc,
          timestamp: new Date().toISOString(),
        };

        results.push(asset);

        await pool.query(
          `
          INSERT INTO stocks_and_funds (
            name, ticker, type, open, high, low, current_price, previous_close, timestamp
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            current_price = EXCLUDED.current_price,
            previous_close = EXCLUDED.previous_close,
            timestamp = EXCLUDED.timestamp;
          `,
          [
            asset.name,
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

        console.log(`Upserted ${ticker} (${asset.name}) successfully.`);
      } catch (innerErr: any) {
        console.error(`Error fetching/updating ${ticker}:`, innerErr.message || innerErr);
      }

      await new Promise((r) => setTimeout(r, 150)); // Rate limit delay
    }
  } catch (err: any) {
    console.error('Fatal error during fetch and DB update:', err);
  } finally {
    // Save JSON file after all done
    const outputPath = path.resolve(__dirname, './data/allAssets.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} assets to ${outputPath}`);

    await pool.end();
  }
}

fetchAndUpsertAssets();
