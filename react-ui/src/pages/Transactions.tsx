import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Transaction {
  id: number;
  transaction_type: string;
  quantity: number;
  price_per_unit: number;
  total_value: number;
  fees: number;
  transaction_date: string;
  notes?: string | null;
}

const formatNumber = (num?: number | string | null) => {
  if (num === null || num === undefined) return '—';
  const n = typeof num === 'number' ? num : Number(num);
  if (isNaN(n)) return '—';
  return n.toFixed(2);
};

const Transactions: React.FC = () => {
  const { userId, ticker } = useParams<{ userId: string; ticker: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !ticker) {
      setError('Missing user or asset ticker');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:4000/api/transactions/${userId}/${ticker}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
      })
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load transactions');
        setLoading(false);
      });
  }, [userId, ticker]);

  const menuItems = ['Dashboard', 'Investments', 'Reports', 'Settings', 'Logout'];

  return (
    <div className="flex min-h-screen bg-darkBg text-textLight">
      <Sidebar menuItems={menuItems} />

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {ticker?.toUpperCase()} Transactions
        </h1>

        {loading && <p className="text-center">Loading transactions...</p>}
        {error && (
          <p className="text-red-500 mb-4 text-center" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && transactions.length === 0 && (
          <p className="text-center">No transactions found for this asset.</p>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-lg card mb-6">
            <table className="table-fixed table" aria-label="Transactions table">
              <colgroup>
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/6" />
              </colgroup>
              <thead className="bg-cardBg">
                <tr>
                  {[
                    'Type',
                    'Quantity',
                    'Price per Unit (€)',
                    'Total Value (€)',
                    'Fees (€)',
                    'Date',
                    'Notes',
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-primaryGreen/20 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">{tx.transaction_type}</td>
                    <td className="px-4 py-3">{formatNumber(tx.quantity)}</td>
                    <td className="px-4 py-3">{formatNumber(tx.price_per_unit)}</td>
                    <td className="px-4 py-3">{formatNumber(tx.total_value)}</td>
                    <td className="px-4 py-3">{formatNumber(tx.fees)}</td>
                    <td className="px-4 py-3">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{tx.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default Transactions;
