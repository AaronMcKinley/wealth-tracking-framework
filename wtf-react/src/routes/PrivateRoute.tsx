import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, authLoading } = useAuth();

  // Show loading state while auth status is being determined
  if (authLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // Only render children if authenticated, otherwise redirect to login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
