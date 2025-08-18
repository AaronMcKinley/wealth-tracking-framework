import React from 'react';
import { Link } from 'react-router-dom';

import icon from '../assets/icon.png';

export default function Header() {
  return (
    <header className="w-full bg-cardBg py-4 shadow-md">
      <div className="flex items-center pl-12 pr-4">
        <Link to="/" className="flex items-center">
          <img src={icon} alt="WTF Icon" className="w-10 h-auto mr-3" />
          <span className="text-xl font-bold text-textLight">Wealth Tracking Framework</span>
        </Link>
      </div>
    </header>
  );
}
