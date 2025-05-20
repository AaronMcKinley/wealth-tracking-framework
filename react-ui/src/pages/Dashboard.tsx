import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Investment {
  id: number;
  name: string;
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

  return (
    <main className="max-w-6xl mx-auto p-6 bg-cardBg text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Dashboard</h2>

      {error && <p className="text-red-500 mb-4 text-center" role="alert">{error}</p>}

      <div className="summary mb-6 text-xl font-semibold text-primaryGreen text-center">
        Total Portfolio Value: €{totalValue.toFixed(2)}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-green-600" aria-label="Investments table">
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
                  className="border border-green-600 px-4 py-2 text-left text-white"
                  scope="col"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id} className="odd:bg-gray-900 even:bg-gray-800">
                <td className="border border-green-600 px-4 py-2">{inv.name}</td>
                <td className="border border-green-600 px-4 py-2">{inv.ticker ?? '—'}</td>
                <td className="border border-green-600 px-4 py-2">{inv.type}</td>
                <td className="border border-green-600 px-4 py-2">{formatNumber(inv.amount)}</td>
                <td className="border border-green-600 px-4 py-2">€{formatNumber(inv.buy_price)}</td>
                <td className="border border-green-600 px-4 py-2">€{formatNumber(inv.current_value)}</td>
                <td className="border border-green-600 px-4 py-2">{formatNumber(inv.interest_rate)}%</td>
                <td className="border border-green-600 px-4 py-2">{formatNumber(inv.profit_loss)}</td>
                <td className="border border-green-600 px-4 py-2">{formatNumber(inv.percent_change_24h)}%</td>
                <td className="border border-green-600 px-4 py-2">{new Date(inv.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Dashboard;
