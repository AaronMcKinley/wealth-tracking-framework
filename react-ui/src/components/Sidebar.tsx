import React from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  'Dashboard',
  'Investments',
  'Add Investment',
  'Reports',
  'Settings',
  'Logout',
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="w-64 bg-cardBg p-6 flex flex-col space-y-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Menu</h2>
      {menuItems.map((item) => {
        if (item === 'Logout') {
          return (
            <button
              key={item}
              onClick={handleLogout}
              className="text-white text-left py-2 px-4 rounded hover:bg-primaryGreen hover:text-darkBg transition-colors"
            >
              {item}
            </button>
          );
        } else {
          return (
            <button
              key={item}
              onClick={() => navigate(`/${item.toLowerCase().replace(/\s+/g, '')}`)}
              className="text-white text-left py-2 px-4 rounded hover:bg-primaryGreen hover:text-darkBg transition-colors"
            >
              {item}
            </button>
          );
        }
      })}
    </nav>
  );
};

export default Sidebar;
