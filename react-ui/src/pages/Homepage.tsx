import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import logo from '../assets/logo.png';

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-textLight">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <img
          src={logo}
          alt="Wealth Tracking Framework Logo"
          className="w-96 h-auto mb-12"
        />

        <div className="card max-w-xl text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            Welcome to Wealth Tracking Framework
          </h1>
          <p className="text-lg text-textMuted mb-8">
            Track your crypto, stocks, bonds, and more—with live price updates and
            transaction locations all in one place.
          </p>

          <div className="flex justify-center space-x-4">
            <Link to="/login" className="w-1/2">
              <button className="btn btn-primary w-full">
                Login
              </button>
            </Link>
            <button className="btn btn-secondary w-1/2">
              Sign Up
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
