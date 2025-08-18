import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import NotFound from '../pages/NotFound';

const NotFoundRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />;
};

export default NotFoundRoute;
