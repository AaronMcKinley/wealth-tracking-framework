import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/signup`, {
        name: form.name,
        email: form.email,
        password: form.password
      });
      if (res.status === 201) {
        setMessage('Signup successful. Redirecting to login...');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed';
      setError(msg);
    }
  };

  return (
    <>
      <Header />
      <div className="card max-w-md mx-auto mt-20 text-textLight">
        <h2 className="text-3xl font-bold mb-6 text-center">Wealth Tracking Framework – Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="block mb-2 font-semibold">Name</label>
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
            <label htmlFor="email" className="block mb-2 font-semibold">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="username"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 font-semibold">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Must include at least 1 symbol and 1 number.
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-semibold">Confirm Password</label>
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
          <button type="submit" className="btn btn-primary w-full">Sign Up</button>
        </form>
      </div>
    </>
  );
};

export default Signup;
