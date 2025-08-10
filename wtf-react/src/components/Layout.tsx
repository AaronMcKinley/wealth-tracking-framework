import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  menuItems?: string[];
}

const Layout: React.FC<LayoutProps> = ({
  children,
  menuItems = ['Dashboard', 'Add Investment', 'Add Savings', 'Settings', 'Logout'],
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-textLight">
      <Header />
      <div className="flex flex-1">
        <Sidebar menuItems={menuItems} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
