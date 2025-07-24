import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
