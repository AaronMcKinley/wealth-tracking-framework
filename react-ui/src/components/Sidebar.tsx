import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  menuItems: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigation = (item: string) => {
    if (item === 'Logout') {
      handleLogout();
    } else {
      navigate(`/${item.toLowerCase().replace(/\s+/g, '')}`);
    }
  };

  return (
    <nav className="w-64 bg-cardBg p-6 flex flex-col space-y-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Menu</h2>
      {menuItems.map((item) => (
        <button
          key={item}
          onClick={() => handleNavigation(item)}
          className="text-white text-left py-2 px-4 rounded hover:bg-primaryGreen hover:text-darkBg transition-colors"
        >
          {item}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
