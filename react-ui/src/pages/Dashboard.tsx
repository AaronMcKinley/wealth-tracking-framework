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
    <div className="dashboard">
      <h2>Dashboard</h2>
      {error && <p>{error}</p>}

      <div className="summary">
        <strong>Total Portfolio Value:</strong> €{totalValue.toFixed(2)}
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Ticker</th> {/* Added ticker header */}
            <th>Type</th>
            <th>Amount</th>
            <th>Buy Price</th>
            <th>Current Value</th>
            <th>Interest Rate</th>
            <th>Profit / Loss</th>
            <th>% Change 24h</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.name}</td>
              <td>{inv.ticker ?? '—'}</td> {/* Render ticker */}
              <td>{inv.type}</td>
              <td>{formatNumber(inv.amount)}</td>
              <td>€{formatNumber(inv.buy_price)}</td>
              <td>€{formatNumber(inv.current_value)}</td>
              <td>{formatNumber(inv.interest_rate)}%</td>
              <td>{formatNumber(inv.profit_loss)}</td>
              <td>{formatNumber(inv.percent_change_24h)}%</td>
              <td>{new Date(inv.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
