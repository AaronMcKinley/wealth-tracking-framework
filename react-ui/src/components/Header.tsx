import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Header() {
  return (
    <header className="w-full bg-cardBg py-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center px-4">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="WTF Logo"
            className="w-12 h-auto mr-3"
          />
          <span className="text-xl font-bold text-textLight">
            Wealth Tracking Framework
          </span>
        </Link>
      </div>
    </header>
  );
}
