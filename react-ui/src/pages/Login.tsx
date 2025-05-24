import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    password: string;
    created_at: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<LoginResponse>(
        'http://localhost:4000/api/login',
        { email, password }
      );
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // full reload so App picks up localStorage
      window.location.href = '/dashboard';
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="card max-w-md mx-auto mt-20 text-textLight">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Wealth Tracking Framework – Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block mb-2 font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Login
        </button>
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
  );
};

export default Login;
