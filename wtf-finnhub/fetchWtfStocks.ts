import axios from 'axios';
import dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { Pool } from 'pg';

import ALL_tickerS from './stocksList';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dataDir = path.resolve(__dirname, './data');
mkdirSync(dataDir, { recursive: true });

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
  open?: number | null;
  high?: number | null;
  low?: number | null;
  current_price: number | null;
  previous_close?: number | null;
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

async function getUsdToEurRate(): Promise<number> {
  try {
    const { data } = await axios.get('https://api.frankfurter.app/latest', {
      params: { from: 'USD', to: 'EUR' },
      timeout: 5000,
    });
    const rate = data?.rates?.EUR;
    if (!rate) throw new Error('EUR rate missing');
    return rate;
  } catch (e: any) {
    console.error('FX fetch failed, using 1.0 fallback:', e.message || e);
    return 1;
  }
}

async function fetchAndUpsertChunk(chunk: typeof ALL_tickerS) {
  const results: Asset[] = [];
  const usdToEur = await getUsdToEurRate();
  console.log(`Using USD→EUR rate: ${usdToEur}`);

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
        profileData.name && profileData.name.trim() !== '' ? profileData.name : ticker;

      const open = quoteData.o ? quoteData.o * usdToEur : null;
      const high = quoteData.h ? quoteData.h * usdToEur : null;
      const low = quoteData.l ? quoteData.l * usdToEur : null;
      const current_price = quoteData.c ? quoteData.c * usdToEur : null;
      const previous_close = quoteData.pc ? quoteData.pc * usdToEur : null;

      const asset: Asset = {
        name: assetName,
        ticker,
        type,
        open,
        high,
        low,
        current_price,
        previous_close,
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
        ],
      );
      console.log(`Upserted ${ticker} (${asset.name}) in EUR successfully.`);
    } catch (innerErr: any) {
      console.error(`Error fetching/updating ${ticker}:`, innerErr.message || innerErr);
    }
    await new Promise((r) => setTimeout(r, 1000));
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
    await new Promise((r) => setTimeout(r, CHUNK_INTERVAL_MS));
  }
}

main();
