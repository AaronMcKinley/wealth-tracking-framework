import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, setUser, logout } = useAuth(); // auth context: user data + logout
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [message, setMessage] = useState('');

  // Delete account confirmation modal state
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const confirmTarget = user?.email ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save updated profile data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('Profile updated!');
        setEdit(false);
        if (user) setUser({ ...user, name: form.name, email: form.email });
      } else {
        setMessage('Update failed.');
      }
    } catch {
      setMessage('Server error.');
    }
  };

  // Delete user account permanently
  const handleDelete = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok || res.status === 204) {
        logout?.(); // clear auth state
        setUser?.(null as any);
        navigate('/', { replace: true });
      } else {
        setMessage('Delete failed.');
      }
    } catch {
      setMessage('Server error.');
    } finally {
      setShowDelete(false);
      setConfirmText('');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8 card">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>

        {/* Profile edit form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              className="input"
              value={form.email}
              disabled={!edit}
              onChange={handleChange}
              type="email"
              data-testid="settings-email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              className="input"
              value={form.name}
              disabled={!edit}
              onChange={handleChange}
              type="text"
              data-testid="settings-name"
            />
          </div>

          {/* Toggle edit/save buttons */}
          {edit ? (
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1" data-testid="settings-save">
                Save
              </button>
              <button
                type="button"
                className="btn btn-negative flex-1"
                onClick={() => {
                  setEdit(false);
                  setForm({ name: user?.name || '', email: user?.email || '' });
                }}
                data-testid="settings-cancel"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => setEdit(true)}
              data-testid="settings-edit"
            >
              Edit
            </button>
          )}

          {/* Danger zone: delete account */}
          <div className="mt-6 border-2 border-negative/60 rounded p-4 bg-negative/10">
            <h3 className="text-lg font-semibold mb-2 text-negative">Danger zone</h3>
            <p className="text-sm opacity-80 mb-3">
              Deleting your account will permanently remove your profile, transactions and
              investments.
            </p>
            <button
              type="button"
              className="btn btn-negative w-full"
              onClick={() => setShowDelete(true)}
              data-testid="settings-delete"
            >
              Delete account
            </button>
          </div>

          {message && <div className="text-center mt-2">{message}</div>}
        </form>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="bg-cardBg p-6 rounded-lg shadow-lg w-full max-w-md">
            <h4 id="delete-title" className="text-xl font-bold mb-2">
              Confirm account deletion
            </h4>
            <p className="text-sm mb-4">
              This action cannot be undone. To confirm, type your email{' '}
              <span className="font-semibold">{confirmTarget}</span> below.
            </p>

            <input
              className="input mb-4"
              placeholder={confirmTarget}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              data-testid="confirm-delete-input"
            />

            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-negative flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={confirmText !== confirmTarget}
                data-testid="confirm-delete"
              >
                Permanently delete
              </button>
              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={() => {
                  setShowDelete(false);
                  setConfirmText('');
                }}
                data-testid="cancel-delete"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Settings;
