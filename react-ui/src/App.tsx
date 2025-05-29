import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddInvestment from './pages/AddInvestment';
import Transactions from './pages/Transactions';
import NotFound from './pages/NotFound';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add-investment" element={<PrivateRoute><AddInvestment /></PrivateRoute>} />
        <Route path="/transactions/:userId/:ticker" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
