import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const passReq = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!passReq.test(password)) {
      setMessage('Password must contain at least one number and one symbol.');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/signup`,
        { name, email, password }
      );
      const data = res.data as any;
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleCancel = () => navigate('/');

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
              autoComplete="name"
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
              className="input"
              autoComplete="email"
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
              className="input"
              autoComplete="new-password"
            />
            <div className="text-xs mt-1 text-gray-400">
              Must contain at least one number and one symbol.
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="input"
              autoComplete="new-password"
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
