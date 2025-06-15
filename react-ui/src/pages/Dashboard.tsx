import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Investment {
  id: number;
  asset_name: string;
  asset_ticker: string;
  type: string;
  total_quantity: number | string;
  average_buy_price: number | string;
  current_price?: number | string | null;
  current_value?: number | string | null;
  profit_loss?: number | string | null;
  percent_change_24h?: number | string | null;
  created_at: string;
}

const formatNumberWithCommas = (num?: number | string | null) => {
  if (num === null || num === undefined) return '—';
  const n = typeof num === 'number' ? num : Number(num);
  return isNaN(n)
    ? '—'
    : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Dashboard: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setError('User not logged in');
      return;
    }

    axios
      .get<Investment[]>('/api/investments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setInvestments(res.data);
        if (location.state?.newInvestment) {
          window.history.replaceState({}, document.title);
        }
      })
      .catch(() => {
        setError('Failed to fetch investments');
      });
  }, [location.state, token, isAuthenticated]);

  const totalValue = investments.reduce((sum, inv) => {
    const val = typeof inv.current_value === 'number' ? inv.current_value : Number(inv.current_value);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalCost = investments.reduce((sum, inv) => {
    const quantity = typeof inv.total_quantity === 'number' ? inv.total_quantity : Number(inv.total_quantity);
    const avgPrice = typeof inv.average_buy_price === 'number' ? inv.average_buy_price : Number(inv.average_buy_price);
    return sum + (isNaN(quantity * avgPrice) ? 0 : quantity * avgPrice);
  }, 0);

  const profitLoss = totalValue - totalCost;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-center">Wealth Tracking Framework</h1>

      {error && (
        <p className="text-red-500 mb-4 text-center" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-center">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">Total Portfolio Value</h2>
          <p className="text-3xl font-bold text-primaryGreen">
            €{formatNumberWithCommas(totalValue)}
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">Total Profit / Loss</h2>
          <p className={`text-3xl font-bold ${profitLoss < 0 ? 'text-negative' : 'text-primaryGreen'}`}>
            €{formatNumberWithCommas(profitLoss)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg mb-6 rounded-lg">
        <table className="table w-full">
          <thead className="bg-cardBg">
            <tr>
              {[
                'Name',
                'Ticker',
                'Type',
                'Quantity',
                'Avg Buy Price',
                'Current Price',
                'Current Value',
                'Profit / Loss',
                '% Change 24h',
                'Date Added',
              ].map(header => (
                <th key={header} className="px-6 py-3 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {investments.map(inv => (
              <tr
                key={inv.id}
                className="hover:bg-primaryGreen/20 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(`/transactions/${userId}/${inv.asset_ticker}`)}
              >
                <td className="px-6 py-4">{inv.asset_name}</td>
                <td className="px-6 py-4">{inv.asset_ticker}</td>
                <td className="px-6 py-4">{inv.type}</td>
                <td className="px-6 py-4">{formatNumberWithCommas(inv.total_quantity)}</td>
                <td className="px-6 py-4">€{formatNumberWithCommas(inv.average_buy_price)}</td>
                <td className="px-6 py-4">€{formatNumberWithCommas(inv.current_price)}</td>
                <td className="px-6 py-4">€{formatNumberWithCommas(inv.current_value)}</td>
                <td className="px-6 py-4">€{formatNumberWithCommas(inv.profit_loss)}</td>
                <td className="px-6 py-4">{formatNumberWithCommas(inv.percent_change_24h)}%</td>
                <td className="px-6 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button onClick={() => navigate('/add-investment')} className="btn btn-primary">
          Add Investment
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;
