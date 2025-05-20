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
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post<LoginResponse>('http://localhost:4000/api/login', {
        email,
        password,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container max-w-md mx-auto bg-cardBg p-8 rounded-lg mt-20 shadow-lg text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block mb-2 text-white font-semibold">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded border border-green-600 bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 text-white font-semibold">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded border border-green-600 bg-darkBg text-white focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primaryGreen text-darkBg font-semibold rounded hover:bg-primaryGreenHover transition-colors"
        >
          Login
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-red-500 font-semibold" role="alert" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;
