import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ASSETS, Asset } from '../data/assets';
import Layout from '../components/Layout';

const API_BASE = '/api';

const AddInvestment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSellMode = location.state?.mode === 'sell';
  const prefillAsset = location.state?.asset || null;

  const [type, setType] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Asset[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (isSellMode && prefillAsset) {
      const matched = ASSETS.find(a => a.ticker === prefillAsset.ticker);
      if (matched) {
        setSelectedAsset(matched);
        setSearchInput(`${matched.fullName} (${matched.ticker})`);
        setType(matched.type);
      }
    }
  }, [isSellMode, prefillAsset]);

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
    const amt = Number(amount);
    const max = Number(prefillAsset?.maxQuantity || 0);

    if (!amount || amt <= 0) {
      setError('Please enter a valid amount (greater than 0).');
      return;
    }

    if (isSellMode && amt > max) {
      setError(`You can only sell up to ${max} units of ${selectedAsset.ticker}.`);
      return;
    }

    if (!buyPrice || Number(buyPrice) <= 0) {
      setError('Please enter a valid price (greater than 0).');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const confirmAddInvestment = async () => {
    setShowConfirm(false);
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!user || !token) {
      setError('User not logged in');
      return;
    }

    const userObj = JSON.parse(user);
    const signedAmount = isSellMode ? -Math.abs(Number(amount)) : Number(amount);

    try {
      const response = await fetch(`${API_BASE}/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userObj.id,
          name: selectedAsset!.ticker,
          amount: signedAmount,
          buy_price: Number(buyPrice),
          type,
          location: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transaction');
      }

      navigate('/dashboard', { state: { newInvestment: true } });
    } catch (err) {
      console.error('Failed to submit transaction:', err);
      setError('Failed to submit transaction.');
    }
  };

  const cancelConfirm = () => setShowConfirm(false);

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isSellMode ? 'Sell Investment' : 'Add Investment'}
        </h1>
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
              disabled={isSellMode}
            />
            {suggestions.length > 0 && !isSellMode && (
              <ul
                id="asset-suggestion-list"
                role="listbox"
                className="absolute z-20 bg-cardBg border border-borderGreen mt-1 rounded max-h-40 overflow-auto w-full"
              >
                {suggestions.map(asset => (
                  <li
                    key={asset.ticker}
                    role="option"
                    aria-selected={selectedAsset?.ticker === asset.ticker ? 'true' : 'false'}
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
              {isSellMode ? 'Sell Amount' : 'Amount'} <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min="0"
              max={isSellMode ? prefillAsset?.maxQuantity || undefined : undefined}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="buyPrice" className="block mb-2 font-semibold">
              {isSellMode ? 'Sell Price (€)' : 'Buy Price (€)'} <span className="text-red-500">*</span>
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
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-negative">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isSellMode ? 'Sell' : 'Add Investment'}
            </button>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
              <div className="card text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Confirm {isSellMode ? 'Sell' : 'Investment'}</h2>
                <p className="mb-4">
                  Type: <strong>{type}</strong><br />
                  Name: <strong>{selectedAsset?.fullName}</strong><br />
                  Ticker: <strong>{selectedAsset?.ticker}</strong><br />
                  {isSellMode ? 'Sell' : 'Amount'}: <strong>{amount}</strong><br />
                  {isSellMode ? 'Sell Price' : 'Buy Price'}: <strong>€{buyPrice}</strong>
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={cancelConfirm} className="btn btn-negative">Cancel</button>
                  <button onClick={confirmAddInvestment} className="btn btn-primary">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default AddInvestment;
