import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TransactionsPage: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();

  const menuItems = ['Dashboard', 'Investments', 'Reports', 'Settings', 'Logout'];

  return (
    <div className="flex min-h-screen bg-darkBg text-white">
      <Sidebar menuItems={menuItems} />

      <main className="flex-1 p-6 overflow-auto max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">{ticker?.toUpperCase()} Transactions</h1>

        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primaryGreen text-darkBg font-semibold rounded hover:bg-primaryGreenHover transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;
