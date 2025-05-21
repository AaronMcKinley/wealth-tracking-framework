import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Asset {
  name: string;      // ticker, used for searches and API
  fullName: string;  // full descriptive name, for display only
  type: string;
}

const ASSETS: Asset[] = [
  { name: 'BTC', fullName: 'Bitcoin', type: 'crypto' },
  { name: 'ETH', fullName: 'Ethereum', type: 'crypto' },
  { name: 'ADA', fullName: 'Cardano', type: 'crypto' },
  { name: 'SOL', fullName: 'Solana', type: 'crypto' },
  { name: 'XRP', fullName: 'Ripple', type: 'crypto' },
  { name: 'AAPL', fullName: 'Apple Inc.', type: 'stock' },
  { name: 'MSFT', fullName: 'Microsoft Corp.', type: 'stock' },
  { name: 'TSLA', fullName: 'Tesla Inc.', type: 'stock' },
  { name: 'AMZN', fullName: 'Amazon.com Inc.', type: 'stock' },
  { name: 'GOOGL', fullName: 'Alphabet Inc.', type: 'stock' },
  { name: 'SPY', fullName: 'SPDR S&P 500 ETF Trust', type: 'etf' },
  { name: 'VOO', fullName: 'Vanguard S&P 500 ETF', type: 'etf' },
  { name: 'UST10Y', fullName: 'US Treasury 10yr', type: 'bond' },
  { name: 'VNQ', fullName: 'Vanguard REIT ETF', type: 'reit' },
  { name: 'GOLD', fullName: 'Gold', type: 'commodity' },
];

const AddInvestment: React.FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Asset[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (searchInput) {
      const filtered = ASSETS.filter(a => {
        const searchLower = searchInput.toLowerCase();
        return (
          a.fullName.toLowerCase().includes(searchLower) ||
          a.name.toLowerCase().includes(searchLower)
        );
      });
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
      setSelectedAsset(null);
      setType('');
    }
  }, [searchInput]);

  const onSelectSuggestion = (asset: Asset) => {
    setSelectedAsset(asset);
    setType(asset.type);
    setSearchInput(`${asset.fullName} (${asset.name})`);
    setSuggestions([]);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset) {
      setError('Please select a valid asset from the suggestions.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount (greater than 0).');
      return;
    }
    if (!buyPrice || Number(buyPrice) <= 0) {
      setError('Please enter a valid buy price (greater than 0).');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const confirmAddInvestment = async () => {
    setShowConfirm(false);

    // Get user from localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      setError('User not logged in');
      return;
    }
    const userObj = JSON.parse(user);

    try {
      await fetch('http://localhost:4000/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userObj.id,
          name: selectedAsset?.name,  // ticker sent to backend
          amount: Number(amount),
          buy_price: Number(buyPrice),
          type,
        }),
      });
      // Navigate back to dashboard after adding
      navigate('/dashboard');
    } catch (e) {
      setError('Failed to add investment.');
    }
  };

  const cancelConfirm = () => setShowConfirm(false);

  const menuItems = [
    'Dashboard',
    'Investments',
    'Reports',
    'Settings',
    'Logout',
  ];

  return (
    <div className="flex min-h-screen bg-darkBg text-white">
      <Sidebar menuItems={menuItems} />

      <main className="flex-1 p-6 overflow-auto max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Add Investment</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="bg-cardBg p-6 rounded-lg shadow-lg space-y-6 relative" noValidate>
          <div>
            <label className="block mb-2 font-semibold">Type *</label>
            <input
              type="text"
              value={type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}
              readOnly
              placeholder="Select an asset"
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white cursor-not-allowed"
              aria-label="Investment type"
            />
          </div>

          <div className="relative">
            <label htmlFor="searchInput" className="block mb-2 font-semibold">
              Search Name or Ticker <span className="text-red-500">*</span>
            </label>
            <input
              id="searchInput"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              required
              autoComplete="off"
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
              placeholder="Type name or ticker"
              aria-autocomplete="list"
              aria-controls="asset-suggestion-list"
              aria-expanded={suggestions.length > 0}
              aria-haspopup="listbox"
            />
            {suggestions.length > 0 && (
              <ul
                id="asset-suggestion-list"
                role="listbox"
                className="absolute z-20 bg-cardBg border border-primaryGreen mt-1 rounded max-h-40 overflow-auto w-full"
              >
                {suggestions.map((asset) => (
                  <li
                    key={asset.name}
                    role="option"
                    aria-selected={selectedAsset?.name === asset.name}
                    className="px-4 py-2 hover:bg-primaryGreen cursor-pointer"
                    onClick={() => onSelectSuggestion(asset)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectSuggestion(asset);
                      }
                    }}
                  >
                    <strong>{asset.fullName}</strong> ({asset.name}) - {asset.type}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block mb-2 font-semibold">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
              aria-label="Investment amount"
            />
          </div>

          <div>
            <label htmlFor="buyPrice" className="block mb-2 font-semibold">
              Buy Price (€) <span className="text-red-500">*</span>
            </label>
            <input
              id="buyPrice"
              type="number"
              step="any"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              required
              min="0"
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
              aria-label="Buy price"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-8 py-3 bg-primaryGreen text-darkBg font-semibold rounded hover:bg-primaryGreenHover transition-colors"
            >
              Add Investment
            </button>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
              <div className="bg-cardBg rounded-lg p-6 max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-4">Confirm Investment</h2>
                <p className="mb-4">
                  Type: <strong>{type}</strong><br />
                  Name: <strong>{selectedAsset?.fullName}</strong><br />
                  Ticker: <strong>{selectedAsset?.name}</strong><br />
                  Amount: <strong>{amount}</strong><br />
                  Buy Price: <strong>€{buyPrice}</strong>
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={confirmAddInvestment}
                    className="bg-primaryGreen px-6 py-2 rounded font-semibold hover:bg-primaryGreenHover transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelConfirm}
                    className="bg-red-600 px-6 py-2 rounded font-semibold hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default AddInvestment;
