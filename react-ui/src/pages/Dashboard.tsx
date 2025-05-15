import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Investment {
  id: number;
  type: string;
  amount: number;
  buy_price: number;
  current_value: number | null;
  interest: number | null;
  currency: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get<Investment[]>('http://localhost:4000/api/investments')
      .then((res) => {
        console.log('Fetched investments:', res.data); // helpful debug log
        setInvestments(res.data);
      })
      .catch(() => setError('Failed to fetch investments'));
  }, []);

  const totalValue = investments.reduce((sum, inv) => {
    const value = typeof inv.current_value === 'number' ? inv.current_value : 0;
    return sum + value;
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
            <th>Type</th>
            <th>Amount</th>
            <th>Buy Price</th>
            <th>Current Value</th>
            <th>Interest</th>
            <th>Currency</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.type}</td>
              <td>{inv.amount}</td>
              <td>€{inv.buy_price}</td>
              <td>€{inv.current_value ?? '—'}</td>
              <td>{inv.interest ?? '—'}</td>
              <td>{inv.currency}</td>
              <td>{new Date(inv.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
