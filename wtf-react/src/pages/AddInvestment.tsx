import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ASSETS, Asset } from '../data/assets';
import Layout from '../components/Layout';

const API_BASE = '/api';

type AssetType = 'crypto' | 'stock' | 'etf' | 'bond' | 'reit' | 'commodity';

function isAssetType(val: string): val is AssetType {
  return ['crypto', 'stock', 'etf', 'bond', 'reit', 'commodity'].includes(val);
}

interface Holding {
  asset_ticker: string;
  asset_name: string;
  type: string;
  total_quantity: number;
}

const AddInvestment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSellMode = location.state?.mode === 'sell';

  const [userHoldings, setUserHoldings] = useState<Holding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState<boolean>(true);

  const [type, setType] = useState<AssetType | ''>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sellAssetTicker, setSellAssetTicker] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [totalSpend, setTotalSpend] = useState<string>('');
  const [assetPrice, setAssetPrice] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Asset[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [totalSpendManuallyEdited, setTotalSpendManuallyEdited] = useState(false);

  useEffect(() => {
    if (isSellMode) {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not logged in');
        setLoadingHoldings(false);
        return;
      }
      fetch(`${API_BASE}/investments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUserHoldings(data.filter((h: any) => Number(h.total_quantity) > 0));
          setLoadingHoldings(false);
        })
        .catch(() => {
          setError('Failed to fetch holdings');
          setLoadingHoldings(false);
        });
    }
  }, [isSellMode]);

  useEffect(() => {
    async function fetchPrice(asset: Asset | null) {
      if (!asset) {
        setAssetPrice(null);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/assets/${asset.ticker}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data && data.current_price) {
          setAssetPrice(Number(data.current_price));
        } else {
          setAssetPrice(null);
        }
      } catch {
        setAssetPrice(null);
      }
    }
    fetchPrice(selectedAsset);
  }, [selectedAsset]);

  useEffect(() => {
    if (assetPrice && amount && selectedAsset && !totalSpendManuallyEdited) {
      const autoValue = (Number(amount) * assetPrice).toFixed(2);
      setTotalSpend(autoValue);
    }
  }, [assetPrice, amount, selectedAsset, totalSpendManuallyEdited]);

  useEffect(() => {
    if (isSellMode && sellAssetTicker) {
      const holding = userHoldings.find(h => h.asset_ticker === sellAssetTicker);
      if (holding) {
        const holdingType = isAssetType(holding.type) ? holding.type : 'stock';
        setSelectedAsset({
          fullName: holding.asset_name,
          ticker: holding.asset_ticker,
          type: holdingType,
        });
        setType(holdingType);
        setError('');
      }
    }
  }, [isSellMode, sellAssetTicker, userHoldings]);

  useEffect(() => {
    if (!isSellMode && searchInput) {
      const searchLower = searchInput.toLowerCase();
      setSuggestions(
        ASSETS.filter(a =>
          a.fullName.toLowerCase().includes(searchLower) ||
          a.ticker.toLowerCase().includes(searchLower)
        )
      );
    } else if (!isSellMode) {
      setSuggestions([]);
      setSelectedAsset(null);
      setType('');
    }
  }, [searchInput, isSellMode]);

  const onSelectSuggestion = (asset: Asset) => {
    setSelectedAsset(asset);
    setType(asset.type as AssetType);
    setSearchInput(`${asset.fullName} (${asset.ticker})`);
    setSuggestions([]);
    setError('');
    setTotalSpendManuallyEdited(false);
  };

  const handleTotalSpendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalSpend(e.target.value);
    setTotalSpendManuallyEdited(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    if (!totalSpendManuallyEdited) {
      if (assetPrice && e.target.value) {
        setTotalSpend((Number(e.target.value) * assetPrice).toFixed(2));
      } else {
        setTotalSpend('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset) {
      setError(isSellMode
        ? 'Please select an asset to sell.'
        : 'Please select a valid asset from the suggestions.'
      );
      return;
    }
    const amt = Number(amount);

    if (!amount || amt <= 0) {
      setError('Please enter a valid amount (greater than 0).');
      return;
    }

    if (isSellMode) {
      const holding = userHoldings.find(h => h.asset_ticker === selectedAsset.ticker);
      const max = holding ? holding.total_quantity : 0;
      if (amt > max) {
        setError(`You can only sell up to ${max} units of ${selectedAsset.ticker}.`);
        return;
      }
    }

    if (!totalSpend || Number(totalSpend) <= 0) {
      setError('Please enter a valid total value (greater than 0).');
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
    const amt = Number(amount);
    const signedAmount = isSellMode ? -Math.abs(amt) : amt;

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
          total_value: Number(totalSpend),
          type,
        }),
      });

      if (!response.ok) {
        const msg = (await response.json()).message || 'Failed to submit transaction';
        throw new Error(msg);
      }

      navigate('/dashboard', { state: { newInvestment: true } });
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction.');
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
        {isSellMode && loadingHoldings && (
          <div className="text-center mb-4">Loading your holdings…</div>
        )}
        <form onSubmit={handleSubmit} className="card space-y-6 relative" noValidate>
          <div className="relative">
            {isSellMode ? (
              <>
                <label className="block mb-2 font-semibold">Asset to Sell *</label>
                <select
                  className="input"
                  value={sellAssetTicker}
                  onChange={e => setSellAssetTicker(e.target.value)}
                  required
                  disabled={loadingHoldings}
                >
                  <option value="">Select asset…</option>
                  {userHoldings
                    .filter(h => h.total_quantity > 0)
                    .map(h => (
                      <option key={h.asset_ticker} value={h.asset_ticker}>
                        {h.asset_name} ({h.asset_ticker}) — Held: {h.total_quantity}
                      </option>
                    ))}
                </select>
              </>
            ) : (
              <>
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
                        aria-selected={selectedAsset?.ticker === asset.ticker ? 'true' : 'false'}
                        className="px-4 py-2 text-textLight hover:bg-primaryGreen hover:text-primaryGreenHover cursor-pointer transition-colors"
                        onClick={() => onSelectSuggestion(asset)}
                      >
                        <strong>{asset.fullName}</strong> ({asset.ticker}) — {asset.type}
                      </li>
                    ))}
                  </ul>
                )}
              </>
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
              onChange={handleAmountChange}
              required
              min="0"
              max={isSellMode && selectedAsset
                ? userHoldings.find(h => h.asset_ticker === selectedAsset.ticker)?.total_quantity || undefined
                : undefined}
              className="input"
              disabled={isSellMode && !selectedAsset}
            />
          </div>
          <div>
            <label htmlFor="unitPrice" className="block mb-2 font-semibold">
              Current Unit Price (€)
            </label>
            <input
              id="unitPrice"
              type="text"
              value={assetPrice !== null ? `€${assetPrice.toFixed(2)}` : ''}
              readOnly
              className="input cursor-not-allowed bg-gray-100"
              tabIndex={-1}
            />
          </div>
          <div>
            <label htmlFor="totalSpend" className="block mb-2 font-semibold">
              {isSellMode ? 'Total Sale Value (€)' : 'Total Spend (€)'} <span className="text-red-500">*</span>
            </label>
            <input
              id="totalSpend"
              type="number"
              step="any"
              value={totalSpend}
              onChange={handleTotalSpendChange}
              required
              min="0"
              className="input"
              disabled={isSellMode && !selectedAsset}
            />
          </div>
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
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-negative">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSellMode && !selectedAsset}>
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
                  Unit Price: <strong>{assetPrice !== null ? `€${assetPrice.toFixed(2)}` : ''}</strong><br />
                  {isSellMode ? 'Total Sale Value' : 'Total Spend'}: <strong>€{totalSpend}</strong>
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
