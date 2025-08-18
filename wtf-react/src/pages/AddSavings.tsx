import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';

const API_BASE = '/api';

type Frequency = 'monthly' | 'yearly' | 'daily' | 'weekly';

interface SavingsAccount {
  id?: number;
  provider: string;
  principal: string;
  interest_rate: string;
  compounding_frequency: Frequency;
}

const initialForm: SavingsAccount = {
  provider: '',
  principal: '',
  interest_rate: '',
  compounding_frequency: 'monthly',
};

const AddSavingsAccount: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRemoveMode = location.state?.mode === 'remove';

  const [form, setForm] = useState<SavingsAccount>(initialForm);
  const [error, setError] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [removeAmount, setRemoveAmount] = useState('');

  useEffect(() => {
    if (isRemoveMode) {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch(`${API_BASE}/savings`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => setAccounts(data))
        .catch(() => setAccounts([]));
    }
  }, [isRemoveMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRemoveMode) {
      if (!selectedAccountId) {
        setError('Select an account to remove.');
        return;
      }
      if (!removeAmount || isNaN(Number(removeAmount)) || Number(removeAmount) <= 0) {
        setError('Enter a valid amount to remove.');
        return;
      }
      setError('');
      setShowConfirm(true);
      return;
    }
    if (!form.provider || !form.principal || !form.interest_rate || !form.compounding_frequency) {
      setError('Please fill in all required fields.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    setShowConfirm(false);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('User not logged in');
      return;
    }

    if (isRemoveMode) {
      const account = accounts.find((a) => String(a.id) === selectedAccountId);
      if (!account) {
        setError('Account not found.');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/savings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            provider: account.provider,
            principal: Number(removeAmount),
            compounding_frequency: account.compounding_frequency,
            mode: 'remove',
          }),
        });
        if (!res.ok) {
          const msg = (await res.json()).message || 'Failed to remove savings';
          throw new Error(msg);
        }
        navigate('/dashboard', { state: { savingsChanged: true } });
      } catch (err: any) {
        setError(err.message || 'Failed to remove savings.');
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/savings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          principal: Number(form.principal),
          interest_rate: Number(form.interest_rate),
        }),
      });
      if (!res.ok) {
        const msg = (await res.json()).message || 'Failed to add savings account';
        throw new Error(msg);
      }
      navigate('/dashboard', { state: { savingsChanged: true } });
    } catch (err: any) {
      setError(err.message || 'Failed to add savings account.');
    }
  };

  const cancelConfirm = () => setShowConfirm(false);

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isRemoveMode ? 'Remove Savings Amount' : 'Add Savings Account'}
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="card space-y-6 relative" noValidate>
          {isRemoveMode ? (
            <>
              <div>
                <label className="block mb-2 font-semibold">Select Account *</label>
                <select
                  className="input"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  required
                >
                  <option value="">Choose an account…</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.provider} — €{acc.principal}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="removeAmount" className="block mb-2 font-semibold">
                  Amount to Remove (€) *
                </label>
                <input
                  id="removeAmount"
                  type="number"
                  step="any"
                  min="0"
                  value={removeAmount}
                  onChange={(e) => setRemoveAmount(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="provider" className="block mb-2 font-semibold">
                  Provider / App / Bank <span className="text-red-500">*</span>
                </label>
                <input
                  id="provider"
                  name="provider"
                  type="text"
                  value={form.provider}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="e.g. Revolut"
                />
              </div>
              <div>
                <label htmlFor="principal" className="block mb-2 font-semibold">
                  Amount (€) <span className="text-red-500">*</span>
                </label>
                <input
                  id="principal"
                  name="principal"
                  type="number"
                  step="any"
                  value={form.principal}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="interest_rate" className="block mb-2 font-semibold">
                  Yearly APR (%) <span className="text-red-500">*</span>
                </label>
                <input
                  id="interest_rate"
                  name="interest_rate"
                  type="number"
                  step="any"
                  value={form.interest_rate}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="compounding_frequency" className="block mb-2 font-semibold">
                  Compounding Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  id="compounding_frequency"
                  name="compounding_frequency"
                  value={form.compounding_frequency}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </>
          )}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-negative"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isRemoveMode ? 'Remove Amount' : 'Add Savings'}
            </button>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
              <div className="card text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">
                  Confirm {isRemoveMode ? 'Removal' : 'Savings Account'}
                </h2>
                <p className="mb-4">
                  {isRemoveMode ? (
                    <>
                      Account:{' '}
                      <strong>
                        {accounts.find((a) => String(a.id) === selectedAccountId)?.provider}
                      </strong>
                      <br />
                      Amount to remove: <strong>€{removeAmount}</strong>
                    </>
                  ) : (
                    <>
                      Provider: <strong>{form.provider}</strong>
                      <br />
                      Amount: <strong>€{form.principal}</strong>
                      <br />
                      APR: <strong>{form.interest_rate}%</strong>
                      <br />
                      Compounding: <strong>{form.compounding_frequency}</strong>
                    </>
                  )}
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={cancelConfirm} className="btn btn-negative">
                    Cancel
                  </button>
                  <button onClick={confirmAction} className="btn btn-primary">
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default AddSavingsAccount;
