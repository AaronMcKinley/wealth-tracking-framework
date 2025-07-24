import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  menuItems: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (item: string) => {
    switch (item) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Settings':
        navigate('/settings');
        break;
      case 'Logout':
        logout();
        navigate('/');
        break;
      default:
        break;
    }
  };

  return (
    <aside className="w-64 bg-cardBg p-6 flex flex-col space-y-4 shadow-lg">
      <h2 className="text-2xl font-bold text-textLight">Menu</h2>
      {menuItems.map((item) => (
        <button
          key={item}
          onClick={() => handleNavigation(item)}
          className="btn btn-primary w-full text-left"
        >
          {item}
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;
