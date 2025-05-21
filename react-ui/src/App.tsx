import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddInvestment from './pages/AddInvestment';
import Transactions from './pages/Transactions';

const App: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem('user');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {isLoggedIn && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/addinvestment" element={<AddInvestment />} />
            <Route path="/transactions/:userId/:ticker" element={<Transactions />} />
          </>
        )}

        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
