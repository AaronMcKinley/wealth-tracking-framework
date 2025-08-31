import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../assets/logo.png';
import Layout from '../components/Layout';

export default function Homepage() {
  return (
    <Layout menuItems={[]}>
      <div className="flex flex-col items-center justify-center px-4 py-12">
        {/* App logo */}
        <img src={logo} alt="Wealth Tracking Framework Logo" className="w-96 h-auto mb-12" />

        {/* Welcome card with app intro and CTA buttons */}
        <div className="card max-w-xl text-center">
          <h1 className="text-5xl font-extrabold mb-4">Welcome to Wealth Tracking Framework</h1>
          <p className="text-lg text-textMuted mb-8">
            Track your crypto, stocks, bonds, and more—with live price updates and transaction
            locations all in one place.
          </p>

          <div className="flex justify-center space-x-4">
            <Link to="/login" className="w-1/2">
              <button className="btn btn-primary w-full">Login</button>
            </Link>
            <Link to="/signup" className="w-1/2">
              <button className="btn btn-primary w-full">Sign Up</button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
