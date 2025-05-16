import axios from 'axios';
import { writeFileSync } from 'fs';
import { Pool } from 'pg';
import COIN_IDS from './coinList';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank?: number;
  price_change_percentage_24h: number;
  image: string;
  last_updated: string;
}

const VS_CURRENCY = 'eur';

const pool = new Pool(); // pulls from .env

const fetchSelectedCoins = async () => {
  console.log('📡 Fetching CoinGecko data...');

  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets';

    const { data } = await axios.get<Coin[]>(url, {
      params: {
        vs_currency: VS_CURRENCY,
        ids: COIN_IDS.join(','),
        order: 'market_cap_desc',
        per_page: COIN_IDS.length,
        page: 1,
        sparkline: false
      }
    });

    // Save to JSON for development
    writeFileSync('./data/wtfCoins.json', JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${data.length} coins to wtfCoins.json`);

    // Upsert into PostgreSQL
    for (const coin of data) {
      await pool.query(
        `
        INSERT INTO cryptocurrencies (
          id, symbol, name, current_price, market_cap, market_cap_rank,
          price_change_percentage_24h, image, last_updated
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        ON CONFLICT (id) DO UPDATE SET
          symbol = EXCLUDED.symbol,
          name = EXCLUDED.name,
          current_price = EXCLUDED.current_price,
          market_cap = EXCLUDED.market_cap,
          market_cap_rank = EXCLUDED.market_cap_rank,
          price_change_percentage_24h = EXCLUDED.price_change_percentage_24h,
          image = EXCLUDED.image,
          last_updated = EXCLUDED.last_updated;
        `,
        [
          coin.id,
          coin.symbol,
          coin.name,
          coin.current_price,
          coin.market_cap,
          coin.market_cap_rank,
          coin.price_change_percentage_24h,
          coin.image,
          coin.last_updated
        ]
      );
    }

    console.log(`✅ Upserted ${data.length} coins into DB`);
  } catch (err: any) {
    console.error('❌ Error fetching or updating data:', err.message);
  } finally {
    await pool.end();
  }
};

fetchSelectedCoins();
