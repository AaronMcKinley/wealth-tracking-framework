import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ASSETS, Asset } from '../data/assets';

const AddInvestment: React.FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Asset[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (searchInput) {
      const searchLower = searchInput.toLowerCase();
      setSuggestions(
        ASSETS.filter(a =>
          a.fullName.toLowerCase().includes(searchLower) ||
          a.ticker.toLowerCase().includes(searchLower)
        )
      );
    } else {
      setSuggestions([]);
      setSelectedAsset(null);
      setType('');
    }
  }, [searchInput]);

  const onSelectSuggestion = (asset: Asset) => {
    setSelectedAsset(asset);
    setType(asset.type);
    setSearchInput(`${asset.fullName} (${asset.ticker})`);
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
          name: selectedAsset!.ticker,
          amount: Number(amount),
          buy_price: Number(buyPrice),
          type,
          location: null
        }),
      });
      navigate('/dashboard');
    } catch {
      setError('Failed to add investment.');
    }
  };

  const cancelConfirm = () => setShowConfirm(false);
  const menuItems = ['Dashboard', 'Investments', 'Reports', 'Settings', 'Logout'];

  return (
    <div className="flex min-h-screen bg-darkBg text-textLight">
      <Sidebar menuItems={menuItems} />
      <main className="flex-1 p-6 overflow-auto max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Add Investment</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="card space-y-6 relative" noValidate>
          <div>
            <label className="block mb-2 font-semibold">Type *</label>
            <input
              type="text"
              value={type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}
              readOnly
              placeholder="Select an asset"
              className="input cursor-not-allowed"
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
              onChange={e => setSearchInput(e.target.value)}
              required
              autoComplete="off"
              className="input"
              placeholder="Type name or ticker"
            />
            {suggestions.length > 0 && (
              <ul
                id="asset-suggestion-list"
                role="listbox"
                className="absolute z-20 bg-cardBg border border-borderGreen mt-1 rounded max-h-40 overflow-auto w-full"
              >
                {suggestions.map(asset => (
                  <li
                    key={asset.ticker}
                    role="option"
                    className="px-4 py-2 text-textLight hover:bg-primaryGreen hover:text-primaryGreenHover cursor-pointer transition-colors"
                    onClick={() => onSelectSuggestion(asset)}
                  >
                    <strong>{asset.fullName}</strong> ({asset.ticker}) — {asset.type}
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
              onChange={e => setAmount(e.target.value)}
              required
              min="0"
              className="input"
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
              onChange={e => setBuyPrice(e.target.value)}
              required
              min="0"
              className="input"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 rounded bg-red-400 hover:bg-red-500 text-white font-semibold transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Investment
            </button>
          </div>
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
              <div className="card text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Confirm Investment</h2>
                <p className="mb-4">
                  Type: <strong>{type}</strong><br />
                  Name: <strong>{selectedAsset?.fullName}</strong><br />
                  Ticker: <strong>{selectedAsset?.ticker}</strong><br />
                  Amount: <strong>{amount}</strong><br />
                  Buy Price: <strong>€{buyPrice}</strong>
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={confirmAddInvestment} className="btn btn-primary">
                    Confirm
                  </button>
                  <button onClick={cancelConfirm} className="px-6 py-2 rounded bg-red-400 hover:bg-red-500 text-white font-semibold transition-colors">
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
