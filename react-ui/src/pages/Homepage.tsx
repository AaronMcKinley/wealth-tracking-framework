import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-darkBg px-4 text-textLight">
      <img
        src={logo}
        alt="Wealth Tracking Framework Logo"
        className="w-32 h-auto mb-6"
      />
      <div className="max-w-xl bg-cardBg p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to Wealth Tracking Framework
        </h1>
        <p className="text-lg text-textMuted mb-8">
          Track your crypto, stocks, bonds, and more—with live price updates and
          transaction locations all in one place.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/login" className="w-1/2">
            <button className="w-full px-6 py-3 bg-primaryGreen hover:bg-primaryGreenHover text-darkBg font-semibold rounded-md transition-colors">
              Login
            </button>
          </Link>

          <button
            className="w-1/2 px-6 py-3 border-2 border-primaryGreen text-primaryGreen font-semibold rounded-md cursor-not-allowed opacity-50"
            disabled
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
