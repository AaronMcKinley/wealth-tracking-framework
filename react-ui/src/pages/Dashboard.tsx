import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

interface Investment {
  id: number;
  name: string;          // full name from DB
  ticker?: string | null;
  type: string;
  amount: number | string;
  buy_price: number | string | null;
  current_value: number | string | null;
  interest_rate: number | string | null;
  profit_loss: number | string | null;
  percent_change_24h: number | string | null;
  created_at: string;
}

const formatNumber = (num: number | string | null | undefined) => {
  if (num === null || num === undefined) return '—';
  const n = typeof num === 'number' ? num : Number(num);
  return isNaN(n) ? '—' : n.toFixed(2);
};

const Dashboard: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a new investment was passed via navigation state
  useEffect(() => {
    if (location.state?.newInvestment) {
      setInvestments((prev) => [...prev, location.state.newInvestment]);
      window.history.replaceState({}, document.title); // clear state after loading
    }
  }, [location.state]);

  useEffect(() => {
    axios
      .get<Investment[]>('http://localhost:4000/api/investments')
      .then((res) => {
        setInvestments(res.data);
      })
      .catch(() => setError('Failed to fetch investments'));
  }, []);

  const totalValue = investments.reduce((sum: number, inv: Investment) => {
    const value = typeof inv.current_value === 'number' ? inv.current_value : Number(inv.current_value);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

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

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Wealth Tracking Framework</h1>

        {error && <p className="text-red-500 mb-4 text-center" role="alert">{error}</p>}

        <div className="summary mb-6 text-xl font-semibold text-primaryGreen text-center">
          Total Portfolio Value: €{totalValue.toFixed(2)}
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg border border-primaryGreen mb-6">
          <table className="min-w-full divide-y divide-primaryGreen" aria-label="Investments table">
            <thead className="bg-cardBg">
              <tr>
                {[
                  'Name',
                  'Ticker',
                  'Type',
                  'Amount',
                  'Buy Price',
                  'Current Value',
                  'Interest Rate',
                  'Profit / Loss',
                  '% Change 24h',
                  'Date',
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-white font-semibold tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-darkBg divide-y divide-primaryGreen">
              {investments.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-primaryGreen/20 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{inv.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{inv.ticker ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{inv.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatNumber(inv.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">€{formatNumber(inv.buy_price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">€{formatNumber(inv.current_value)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatNumber(inv.interest_rate)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatNumber(inv.profit_loss)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatNumber(inv.percent_change_24h)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(inv.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/addinvestment')}
            className="px-6 py-3 bg-primaryGreen text-darkBg font-semibold rounded hover:bg-primaryGreenHover transition-colors"
          >
            Add Investment
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
