import axios from 'axios';
import { writeFileSync } from 'fs';
import { Pool } from 'pg';
import COIN_IDS from './coinList';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

interface Coin {
  id: string;
  ticker: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank?: number;
  price_change_24h?: number;
  price_change_percentage_24h: number;
  total_supply?: number | null;
  ath?: number;
  atl?: number;
  last_updated: string;
}

const VS_CURRENCY = 'eur';

const pool = new Pool();

const fetchSelectedCoins = async () => {
  console.log('Fetching CoinGecko data...');

  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets';

    const { data: rawData } = await axios.get<any[]>(url, {
      params: {
        vs_currency: VS_CURRENCY,
        ids: COIN_IDS.join(','),
        order: 'market_cap_desc',
        per_page: COIN_IDS.length,
        page: 1,
        sparkline: false,
      },
    });

    // Save raw API data for debugging (with symbol from CoinGecko)
    writeFileSync('./data/wtfCoins.json', JSON.stringify(rawData, null, 2));
    console.log(`Saved full CoinGecko data for ${rawData.length} coins.`);

    // Map CoinGecko's symbol to ticker internally
    const dataForDb: Coin[] = rawData.map((coin: any) => ({
      id: coin.id,
      ticker: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_24h: coin.price_change_24h,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      total_supply: coin.total_supply,
      ath: coin.ath,
      atl: coin.atl,
      last_updated: coin.last_updated,
    }));

    for (const coin of dataForDb) {
      await pool.query(
        `
        INSERT INTO cryptocurrencies (
          id, ticker, name, image, current_price, market_cap, market_cap_rank,
          price_change_24h, price_change_percentage_24h, total_supply,
          ath, atl, last_updated
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10,
          $11, $12, $13
        )
        ON CONFLICT (id) DO UPDATE SET
          ticker = EXCLUDED.ticker,
          name = EXCLUDED.name,
          image = EXCLUDED.image,
          current_price = EXCLUDED.current_price,
          market_cap = EXCLUDED.market_cap,
          market_cap_rank = EXCLUDED.market_cap_rank,
          price_change_24h = EXCLUDED.price_change_24h,
          price_change_percentage_24h = EXCLUDED.price_change_percentage_24h,
          total_supply = EXCLUDED.total_supply,
          ath = EXCLUDED.ath,
          atl = EXCLUDED.atl,
          last_updated = EXCLUDED.last_updated;
        `,
        [
          coin.id,
          coin.ticker,
          coin.name,
          coin.image,
          coin.current_price,
          coin.market_cap,
          coin.market_cap_rank,
          coin.price_change_24h,
          coin.price_change_percentage_24h,
          coin.total_supply,
          coin.ath,
          coin.atl,
          coin.last_updated,
        ]
      );
    }

    console.log(`Inserted/Updated ${dataForDb.length} coins into DB`);
  } catch (err: any) {
    console.error('Error fetching or updating data:', err);
  } finally {
    await pool.end();
  }
};

fetchSelectedCoins();
