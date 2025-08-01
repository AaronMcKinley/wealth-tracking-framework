import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddInvestment from './pages/AddInvestment';
import Transactions from './pages/Transactions';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Settings from './pages/Settings';

const ConditionalFallback = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <NotFound /> : <Login />;
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add-investment" element={<PrivateRoute><AddInvestment /></PrivateRoute>} />
        <Route path="/transactions/:userId/:ticker" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/savings" element={<PrivateRoute><AddSavings /></PrivateRoute>} />
        <Route path="*" element={<ConditionalFallback />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
