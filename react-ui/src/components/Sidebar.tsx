import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  menuItems: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const navigate = useNavigate();

  const handleNavigation = (item: string) => {
    switch (item) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Logout':
        localStorage.removeItem('user');
        navigate('/');
        break;
      default:
        // other items not wired up yet
        break;
    }
  };

  return (
    <aside className="w-64 bg-cardBg p-6 flex flex-col space-y-4 shadow-lg">
      <h2 className="text-2xl font-bold text-textLight">Menu</h2>
      {menuItems.map(item => (
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
