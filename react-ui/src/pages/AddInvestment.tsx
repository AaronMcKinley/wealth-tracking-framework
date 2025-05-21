import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MOCK_ASSETS = {
  crypto: ['Bitcoin', 'Ethereum', 'Cardano', 'Solana', 'Dogecoin', 'Ripple'],
  stock: ['Apple', 'Microsoft', 'Tesla', 'Amazon', 'Google', 'Ripple Labs'],
  etf: ['SPY', 'VOO', 'QQQ', 'IVV'],
  bond: ['US Treasury 10yr', 'Corporate Bond A'],
  reit: ['Vanguard REIT ETF', 'Realty Income'],
  commodity: ['Gold', 'Silver', 'Crude Oil'],
};

// Flatten all assets into one list for autocomplete
const ALL_ASSETS = Object.values(MOCK_ASSETS).flat();

const AddInvestment: React.FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (name) {
      const filtered = ALL_ASSETS.filter((item) =>
        item.toLowerCase().includes(name.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !name || !amount || !buyPrice) {
      setError('Please fill in all required fields.');
      return;
    }

    // TODO: Submit form data to API here
    alert(`Added investment: ${type} - ${name}`);

    navigate('/dashboard');
  };

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

      <main className="flex-1 p-6 overflow-auto max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Add Investment</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="bg-cardBg p-6 rounded-lg shadow-lg flex flex-wrap gap-6 items-end"
        >
          {/* Type Selector */}
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="type" className="block mb-2 font-semibold">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            >
              <option value="">Select type</option>
              {Object.keys(MOCK_ASSETS).map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Name input with suggestions */}
          <div className="flex-1 min-w-[240px] relative">
            <label htmlFor="name" className="block mb-2 font-semibold">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Start typing to see suggestions"
              autoComplete="off"
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-cardBg border border-primaryGreen mt-1 rounded max-h-40 overflow-auto w-full">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="px-4 py-2 hover:bg-primaryGreen cursor-pointer"
                    onClick={() => setName(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ticker input */}
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="ticker" className="block mb-2 font-semibold">
              Ticker
            </label>
            <input
              id="ticker"
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Optional"
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            />
          </div>

          {/* Amount input */}
          <div className="flex-1 min-w-[140px]">
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
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            />
          </div>

          {/* Buy Price input */}
          <div className="flex-1 min-w-[140px]">
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
              className="w-full p-3 rounded border border-primaryGreen bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            />
          </div>

          {/* Submit Button */}
          <div className="w-full mt-4 text-right">
            <button
              type="submit"
              className="px-8 py-3 bg-primaryGreen text-darkBg font-semibold rounded hover:bg-primaryGreenHover transition-colors"
            >
              Add Investment
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddInvestment;
