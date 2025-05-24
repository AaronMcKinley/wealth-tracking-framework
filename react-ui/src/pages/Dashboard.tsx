import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

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

const formatNumber = (num?: number | string | null) => {
  if (num === null || num === undefined) return '—';
  const n = typeof num === 'number' ? num : Number(num);
  if (isNaN(n)) return '—';
  return n.toFixed(2);
};

const Dashboard: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const user = localStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : null;

  useEffect(() => {
    if (location.state?.newInvestment) {
      setInvestments(prev => [...prev, location.state.newInvestment]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    axios
      .get<Investment[]>('http://localhost:4000/api/investments')
      .then(res => setInvestments(res.data))
      .catch(() => setError('Failed to fetch investments'));
  }, []);

  const totalValue = investments.reduce((sum, inv) => {
    const val =
      typeof inv.current_value === 'number'
        ? inv.current_value
        : Number(inv.current_value);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const menuItems = [
    'Dashboard',
    'Add Investment',
    'Investments',
    'Reports',
    'Settings',
    'Logout'
  ];

  return (
    <div className="flex min-h-screen bg-darkBg text-textLight">
      <Sidebar menuItems={menuItems} />

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Wealth Tracking Framework
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-center" role="alert">
            {error}
          </p>
        )}

        <div className="mb-6 text-xl font-semibold text-primaryGreen text-center">
          Total Portfolio Value: €{totalValue.toFixed(2)}
        </div>

        <div className="overflow-x-auto shadow-lg mb-6 rounded-lg">
          <table className="table">
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
                  'Date Added'
                ].map(header => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left font-semibold"
                  >
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
                  onClick={() => {
                    if (!userId) {
                      alert('User not logged in');
                      return;
                    }
                    navigate(
                      `/transactions/${userId}/${inv.asset_ticker}`
                    );
                  }}
                >
                  <td className="px-6 py-4">{inv.asset_name}</td>
                  <td className="px-6 py-4">{inv.asset_ticker}</td>
                  <td className="px-6 py-4">{inv.type}</td>
                  <td className="px-6 py-4">
                    {formatNumber(inv.total_quantity)}
                  </td>
                  <td className="px-6 py-4">
                    €{formatNumber(inv.average_buy_price)}
                  </td>
                  <td className="px-6 py-4">
                    €{formatNumber(inv.current_price)}
                  </td>
                  <td className="px-6 py-4">
                    €{formatNumber(inv.current_value)}
                  </td>
                  <td className="px-6 py-4">
                    €{formatNumber(inv.profit_loss)}
                  </td>
                  <td className="px-6 py-4">
                    {formatNumber(inv.percent_change_24h)}%
                  </td>
                  <td className="px-6 py-4">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/add-investment')}
            className="btn btn-primary"
          >
            Add Investment
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
