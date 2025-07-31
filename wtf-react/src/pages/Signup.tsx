import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

interface SignupResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<SignupResponse>(
        `${process.env.REACT_APP_API_URL}/api/signup`,
        { name, email, password }
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Signup failed';
      setMessage(errorMsg);
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
          Wealth Tracking Framework – Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="block mb-2 font-semibold">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
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
              autoComplete="new-password"
              className="input"
            />
          </div>
          <div className="flex flex-col gap-2">
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
          <div className="flex justify-center mt-2 text-sm">
            <a href="/login" className="text-blue-500 hover:underline">
              Login
            </a>
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
    </>
  );
};

export default Signup;
