import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import AddInvestment from './pages/AddInvestment';
import AddSavings from './pages/AddSavings';
import Dashboard from './pages/Dashboard';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Transactions from './pages/Transactions';
import PrivateRoute from './routes/PrivateRoute';

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
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-investment"
          element={
            <PrivateRoute>
              <AddInvestment />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions/:userId/:ticker"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/savings"
          element={
            <PrivateRoute>
              <AddSavings />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<ConditionalFallback />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
