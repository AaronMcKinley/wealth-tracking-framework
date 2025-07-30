import axios from 'axios';
import { writeFileSync } from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import ALL_tickerS from './stocksList';

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

const CHUNK_SIZE = 20;
const CHUNK_INTERVAL_MS = 2 * 60 * 1000;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

const ALL_CHUNKS = chunkArray(ALL_tickerS, CHUNK_SIZE);

async function fetchAndUpsertChunk(chunk: typeof ALL_tickerS) {
  const results: Asset[] = [];
  for (const { ticker, type } of chunk) {
    try {
      const quoteResponse = await axios.get('https://finnhub.io/api/v1/quote', {
        params: { symbol: ticker, token: API_KEY },
      });
      const quoteData = quoteResponse.data;
      const profileResponse = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
        params: { symbol: ticker, token: API_KEY },
      });
      const profileData = profileResponse.data;
      const assetName =
        profileData.name && profileData.name.trim() !== ''
          ? profileData.name
          : ticker;
      const asset: Asset = {
        name: assetName,
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
    await new Promise(r => setTimeout(r, 1000));
  }
  const outputPath = path.resolve(__dirname, `./data/assets-chunk.json`);
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} assets to ${outputPath}`);
}

async function main() {
  let chunkIdx = 0;
  while (true) {
    console.log(`\n========== Fetching chunk ${chunkIdx + 1}/${ALL_CHUNKS.length} ==========\n`);
    await fetchAndUpsertChunk(ALL_CHUNKS[chunkIdx]);
    chunkIdx = (chunkIdx + 1) % ALL_CHUNKS.length;
    console.log(`Sleeping ${CHUNK_INTERVAL_MS / 1000 / 60} minutes before next chunk...`);
    await new Promise(r => setTimeout(r, CHUNK_INTERVAL_MS));
  }
}

main();
