import axios from 'axios';
import { writeFileSync } from 'fs';
import COIN_IDS from './coinList';

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

const fetchSelectedCoins = async () => {
  console.log('📡 Starting CoinGecko fetcher with custom list...');

  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets';

    const { data } = await axios.get<Coin[]>(url, {
      params: {
        vs_currency: VS_CURRENCY,
        ids: COIN_IDS.join(','), // ✅ Custom list
        order: 'market_cap_desc',
        per_page: COIN_IDS.length,
        page: 1,
        sparkline: false
      }
    });

    writeFileSync('./data/wtfCoins.json', JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${data.length} coins to wtfCoins.json`);
  } catch (err: any) {
    console.error('❌ Error fetching CoinGecko data:', err.message);
  }
};

fetchSelectedCoins();
