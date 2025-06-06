export type AssetType = 'crypto' | 'stock' | 'etf' | 'reit' | 'commodity' | 'bond';

export interface Asset {
  ticker: string;
  fullName: string;
  type: AssetType;
}

export const ASSETS: Asset[] = [
  { ticker: 'AAPL', fullName: 'Apple Inc.', type: 'stock' },
  { ticker: 'MSFT', fullName: 'Microsoft Corp.', type: 'stock' },
  { ticker: 'GOOGL', fullName: 'Alphabet Inc.', type: 'stock' },
  { ticker: 'AMZN', fullName: 'Amazon.com Inc.', type: 'stock' },
  { ticker: 'NVDA', fullName: 'NVIDIA Corp.', type: 'stock' },
  { ticker: 'TSLA', fullName: 'Tesla Inc.', type: 'stock' },
  { ticker: 'META', fullName: 'Meta Platforms Inc.', type: 'stock' },
  { ticker: 'IBM', fullName: 'IBM Corp.', type: 'stock' },
  { ticker: 'ORCL', fullName: 'Oracle Corp.', type: 'stock' },
  { ticker: 'ADBE', fullName: 'Adobe Inc.', type: 'stock' },
  { ticker: 'INTU', fullName: 'Intuit Inc.', type: 'stock' },
  { ticker: 'SAP', fullName: 'SAP SE', type: 'stock' },
  { ticker: 'JPM', fullName: 'JPMorgan Chase & Co.', type: 'stock' },
  { ticker: 'V', fullName: 'Visa Inc.', type: 'stock' },
  { ticker: 'MA', fullName: 'Mastercard Inc.', type: 'stock' },
  { ticker: 'BAC', fullName: 'Bank of America Corp.', type: 'stock' },
  { ticker: 'JNJ', fullName: 'Johnson & Johnson', type: 'stock' },
  { ticker: 'PFE', fullName: 'Pfizer Inc.', type: 'stock' },
  { ticker: 'UNH', fullName: 'UnitedHealth Group Inc.', type: 'stock' },
  { ticker: 'ABT', fullName: 'Abbott Laboratories', type: 'stock' },
  { ticker: 'PG', fullName: 'Procter & Gamble Co.', type: 'stock' },
  { ticker: 'KO', fullName: 'Coca-Cola Co.', type: 'stock' },
  { ticker: 'PEP', fullName: 'PepsiCo Inc.', type: 'stock' },
  { ticker: 'WMT', fullName: 'Walmart Inc.', type: 'stock' },
  { ticker: 'COST', fullName: 'Costco Wholesale Corp.', type: 'stock' },
  { ticker: 'DIS', fullName: 'Walt Disney Co.', type: 'stock' },
  { ticker: 'NKE', fullName: 'Nike Inc.', type: 'stock' },
  { ticker: 'AMD', fullName: 'Advanced Micro Devices Inc.', type: 'stock' },
  { ticker: 'INTC', fullName: 'Intel Corp.', type: 'stock' },
  { ticker: 'RYAAY', fullName: 'Ryanair Holdings plc', type: 'stock' },
  { ticker: 'CRH', fullName: 'CRH plc', type: 'stock' },
  { ticker: 'PDYPY', fullName: 'Pernod Ricard SA', type: 'stock' },
  { ticker: 'MCD', fullName: 'McDonald’s Corp.', type: 'stock' },

  // ETFs
  { ticker: 'VT', fullName: 'Vanguard Total World Stock ETF', type: 'etf' },
  { ticker: 'VEA', fullName: 'Vanguard FTSE Developed Markets ETF', type: 'etf' },
  { ticker: 'VWO', fullName: 'Vanguard FTSE Emerging Markets ETF', type: 'etf' },
  { ticker: 'SPY', fullName: 'SPDR S&P 500 ETF Trust', type: 'etf' },
  { ticker: 'VOO', fullName: 'Vanguard S&P 500 ETF', type: 'etf' },
  { ticker: 'VTI', fullName: 'Vanguard Total Stock Market ETF', type: 'etf' },
  { ticker: 'QQQ', fullName: 'Invesco QQQ Trust', type: 'etf' },
  { ticker: 'IWM', fullName: 'iShares Russell 2000 ETF', type: 'etf' },
  { ticker: 'XLK', fullName: 'Technology Select Sector SPDR Fund', type: 'etf' },
  { ticker: 'XLF', fullName: 'Financial Select Sector SPDR Fund', type: 'etf' },
  { ticker: 'XLE', fullName: 'Energy Select Sector SPDR Fund', type: 'etf' },
  { ticker: 'XLV', fullName: 'Health Care Select Sector SPDR Fund', type: 'etf' },
  { ticker: 'XLY', fullName: 'Consumer Discretionary Select Sector SPDR Fund', type: 'etf' },

  // REITs
  { ticker: 'VNQ', fullName: 'Vanguard Real Estate ETF', type: 'reit' },
  { ticker: 'SPG', fullName: 'Simon Property Group Inc.', type: 'reit' },
  { ticker: 'PLD', fullName: 'Prologis Inc.', type: 'reit' },
  { ticker: 'O', fullName: 'Realty Income Corp.', type: 'reit' },
  { ticker: 'AMT', fullName: 'American Tower Corp.', type: 'reit' },

  // Commodities
  { ticker: 'GLD', fullName: 'SPDR Gold Shares', type: 'commodity' },
  { ticker: 'SLV', fullName: 'iShares Silver Trust', type: 'commodity' },
  { ticker: 'PPLT', fullName: 'Aberdeen Physical Platinum Shares ETF', type: 'commodity' },
  { ticker: 'USO', fullName: 'United States Oil Fund', type: 'commodity' },
  { ticker: 'DBA', fullName: 'Invesco DB Agriculture Fund', type: 'commodity' },
  { ticker: 'UNG', fullName: 'United States Natural Gas Fund', type: 'commodity' },

  // Bonds
  { ticker: 'BND', fullName: 'Vanguard Total Bond Market ETF', type: 'bond' },
  { ticker: 'TLT', fullName: 'iShares 20+ Year Treasury Bond ETF', type: 'bond' },
  { ticker: 'AGG', fullName: 'iShares Core U.S. Aggregate Bond ETF', type: 'bond' },

  // Cryptocurrencies
  { ticker: 'BTC', fullName: 'Bitcoin', type: 'crypto' },
  { ticker: 'ETH', fullName: 'Ethereum', type: 'crypto' },
  { ticker: 'USDT', fullName: 'Tether', type: 'crypto' },
  { ticker: 'XRP', fullName: 'Ripple', type: 'crypto' },
  { ticker: 'BNB', fullName: 'Binance Coin', type: 'crypto' },
  { ticker: 'SOL', fullName: 'Solana', type: 'crypto' },
  { ticker: 'USDC', fullName: 'USD Coin', type: 'crypto' },
  { ticker: 'DOGE', fullName: 'Dogecoin', type: 'crypto' },
  { ticker: 'ADA', fullName: 'Cardano', type: 'crypto' },
  { ticker: 'TRX', fullName: 'TRON', type: 'crypto' },
  { ticker: 'SUI', fullName: 'Sui', type: 'crypto' },
  { ticker: 'LINK', fullName: 'Chainlink', type: 'crypto' },
  { ticker: 'AVAX', fullName: 'Avalanche', type: 'crypto' },
  { ticker: 'XLM', fullName: 'Stellar', type: 'crypto' },
  { ticker: 'SHIB', fullName: 'Shiba Inu', type: 'crypto' },
  { ticker: 'HBAR', fullName: 'Hedera Hashgraph', type: 'crypto' },
  { ticker: 'TON', fullName: 'The Open Network', type: 'crypto' },
  { ticker: 'LTC', fullName: 'Litecoin', type: 'crypto' },
  { ticker: 'DOT', fullName: 'Polkadot', type: 'crypto' },
  { ticker: 'XMR', fullName: 'Monero', type: 'crypto' },
  { ticker: 'PEPE', fullName: 'Pepe', type: 'crypto' },
  { ticker: 'BCH', fullName: 'Bitcoin Cash', type: 'crypto' },
  { ticker: 'CRO', fullName: 'Crypto.com Chain', type: 'crypto' },
  { ticker: 'ALGO', fullName: 'Algorand', type: 'crypto' },
  { ticker: 'AAVE', fullName: 'Aave', type: 'crypto' },
  { ticker: 'MATIC', fullName: 'Polygon (MATIC)', type: 'crypto' },
  { ticker: 'KAS', fullName: 'Kaspa', type: 'crypto' },
  { ticker: 'RNDR', fullName: 'Render Token', type: 'crypto' },
  { ticker: 'NEAR', fullName: 'NEAR Protocol', type: 'crypto' },
  { ticker: 'FART', fullName: 'FartCoin', type: 'crypto' }
];
