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
  total_profit_loss?: number | string | null;
}

interface SavingsAccount {
  id: number;
  provider: string;
  principal: string;
  interest_rate: string;
  compounding_frequency: string;
  total_interest_paid: string;
  accrued_interest?: string;
  expected_next_interest?: string;
  next_payout?: string;
}

const formatNumberWithCommas = (num?: number | string | null) => {
  if (num === null || num === undefined) return '—';
  const n = typeof num === 'number' ? num : Number(num);
  return isNaN(n)
    ? '—'
    : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseEuroString = (val: string | undefined | null) => {
  if (!val) return 0;
  return Number(val.replace(/[^0-9.-]+/g,""));
};

const Dashboard: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [savings, setSavings] = useState<SavingsAccount[]>([]);
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

    const fetchInvestments = async () => {
      try {
        const res = await axios.get<Investment[]>(
          `${process.env.REACT_APP_API_URL}/api/investments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setInvestments(res.data);
        if (location.state?.newInvestment) {
          window.history.replaceState({}, document.title);
        }
      } catch (err) {
        setError('Failed to fetch investments');
      }
    };

    const fetchSavings = async () => {
      try {
        const res = await axios.get<SavingsAccount[]>(
          `${process.env.REACT_APP_API_URL}/api/savings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSavings(res.data);
      } catch (err) {}
    };

    fetchInvestments();
    fetchSavings();
  }, [location.state, token, isAuthenticated]);

  const totalValue = investments.reduce((sum, inv) => {
    const val = typeof inv.current_value === 'number' ? inv.current_value : Number(inv.current_value);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalPL = investments.reduce((sum, inv) => {
    const pl = ((typeof inv.profit_loss === 'number' ? inv.profit_loss : Number(inv.profit_loss)) || 0) +
               ((typeof inv.total_profit_loss === 'number' ? inv.total_profit_loss : Number(inv.total_profit_loss)) || 0);
    return sum + (isNaN(pl) ? 0 : pl);
  }, 0);

  const totalSavingsValue = savings.reduce((sum, s) => {
    return sum + parseEuroString(s.principal) + parseEuroString(s.total_interest_paid);
  }, 0);

  const totalSavingsInterest = savings.reduce((sum, s) => {
    return sum + parseEuroString(s.total_interest_paid);
  }, 0);

  const hasSellable = investments.some(inv => Number(inv.total_quantity) > 0);

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
            €{formatNumberWithCommas(totalValue + totalSavingsValue)}
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">Total Profit / Loss</h2>
          <p className={`text-3xl font-bold ${totalPL + totalSavingsInterest < 0 ? 'text-negative' : 'text-primaryGreen'}`}>
            €{formatNumberWithCommas(totalPL + totalSavingsInterest)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg mb-6 rounded-lg">
        <table className="table w-full">
          <thead className="bg-cardBg">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Ticker</th>
              <th className="px-6 py-3 text-left font-semibold">Type</th>
              <th className="px-6 py-3 text-left font-semibold">Quantity</th>
              <th className="px-6 py-3 text-left font-semibold">Avg Buy Price</th>
              <th className="px-6 py-3 text-left font-semibold">Current Price</th>
              <th className="px-6 py-3 text-left font-semibold">Profit / Loss</th>
              <th className="px-6 py-3 text-left font-semibold">% Change 24h</th>
              <th className="px-6 py-3 text-left font-semibold">Total</th>
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
                <td className="px-6 py-4">
                  €{formatNumberWithCommas(
                    ((typeof inv.profit_loss === 'number' ? inv.profit_loss : Number(inv.profit_loss)) || 0) +
                    ((typeof inv.total_profit_loss === 'number' ? inv.total_profit_loss : Number(inv.total_profit_loss)) || 0)
                  )}
                </td>
                <td className="px-6 py-4">{formatNumberWithCommas(inv.percent_change_24h)}%</td>
                <td className="px-6 py-4">€{formatNumberWithCommas(inv.current_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          className="btn btn-primary min-w-[160px]"
          onClick={() => navigate('/add-investment')}
          type="button"
        >
          Add Investment
        </button>
        <button
          className="btn btn-negative min-w-[160px]"
          onClick={() => navigate('/add-investment', { state: { mode: 'sell' } })}
          type="button"
        >
          Sell Investment
        </button>
      </div>
      {!hasSellable && (
        <div className="w-full text-center text-sm text-gray-400 italic pt-2">
          Nothing to sell
        </div>
      )}

      {savings.length > 0 && (
        <div className="overflow-x-auto shadow-lg mt-10 rounded-lg">
          <h2 className="text-xl font-bold text-center py-4">Savings Accounts</h2>
          <table className="table w-full">
            <thead className="bg-cardBg">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Provider</th>
                <th className="px-6 py-3 text-left font-semibold">Principal</th>
                <th className="px-6 py-3 text-left font-semibold">APR (%)</th>
                <th className="px-6 py-3 text-left font-semibold">Interest Paid</th>
                <th className="px-6 py-3 text-left font-semibold">Next Payment (€)</th>
                <th className="px-6 py-3 text-left font-semibold">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {savings.map(s => (
                <tr key={s.id} className="hover:bg-primaryGreen/20 transition-colors duration-200">
                  <td className="px-6 py-4">{s.provider || '—'}</td>
                  <td className="px-6 py-4">€{formatNumberWithCommas(s.principal)}</td>
                  <td className="px-6 py-4">{s.interest_rate}</td>
                  <td className="px-6 py-4">€{formatNumberWithCommas(s.total_interest_paid)}</td>
                  <td className="px-6 py-4">€{formatNumberWithCommas(s.next_payout)}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const p = parseEuroString(s.principal);
                      const t = parseEuroString(s.total_interest_paid);
                      if (isNaN(p + t)) return '—';
                      return '€' + (p + t).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          className="btn btn-primary min-w-[160px]"
          onClick={() => navigate('/savings')}
          type="button"
        >
          Add Savings
        </button>
        <button
          className="btn btn-negative min-w-[160px]"
          onClick={() => navigate('/savings', { state: { mode: 'remove' } })}
          type="button"
        >
          Remove Savings
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;
