import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface LoginResponse {
  message: string;
  token: string;
  user: { id: number; email: string; name: string };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<LoginResponse>(`${process.env.REACT_APP_API_URL}/api/login`, {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setMessage(errorMsg);
    }
  };

  const handleCancel = () => navigate('/');

  return (
    <Layout>
      <div className="card max-w-md mx-auto mt-20 text-textLight pb-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Wealth Tracking Framework – Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="block mb-2 font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input"
            />
          </div>

          <div className="flex flex-col gap-4">
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-negative w-full">
              Cancel
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <Link to="/signup" className="w-1/2">
              <button type="button" className="btn btn-primary w-full">
                Sign Up
              </button>
            </Link>
          </div>
        </form>

        {message && (
          <p
            className="mt-4 text-center text-red-500 font-semibold"
            role="alert"
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default Login;
