import axios from 'axios';
import { writeFileSync } from 'fs';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  image: string;
  last_updated: string;
}

const COINS = 25;
const VS_CURRENCY = 'eur';

const fetchTopCoins = async () => {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets';
    const { data } = await axios.get<Coin[]>(url, {
      params: {
        vs_currency: VS_CURRENCY,
        order: 'market_cap_desc',
        per_page: COINS,
        page: 1,
      },
    });

    writeFileSync('top25.json', JSON.stringify(data, null, 2));
    console.log(`✅ Fetched top ${COINS} coins to top25.json`);
  } catch (err: any) {
    console.error('❌ Error fetching CoinGecko data:', err.message);
  }
};

fetchTopCoins();
