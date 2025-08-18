import React from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  menuItems?: string[];
}

const Layout: React.FC<LayoutProps> = ({
  children,
  menuItems = ['Dashboard', 'Add Investment', 'Add Savings', 'Settings', 'Logout'],
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const showSidebar = isAuthenticated && location.pathname !== '/';

  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-textLight">
      <Header />
      <div className="flex flex-1">
        {showSidebar && <Sidebar menuItems={menuItems} />}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
