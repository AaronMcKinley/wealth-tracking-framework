import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

const Signup: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validatePassword = (password: string) => {
    return /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must include a number and a symbol.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/signup`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed';
      setError(msg);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className="card max-w-md mx-auto mt-20 text-textLight">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Wealth Tracking Framework – Signup
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="block mb-2 font-semibold">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 font-semibold">
              Password <span title="Must contain a number and symbol" className="ml-1 text-sm text-gray-400 cursor-help">?</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div className="flex flex-col gap-4">
            <button type="submit" className="btn btn-primary w-full">
              Sign Up
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-negative w-full"
            >
              Cancel
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <Link to="/login" className="w-1/2">
              <button type="button" className="btn btn-primary w-full text-sm">
                Sign In
              </button>
            </Link>
          </div>
        </form>
        {error && (
          <p className="mt-4 text-center text-red-500 font-semibold" role="alert">
            {error}
          </p>
        )}
      </div>
    </>
  );
};

export default Signup;
