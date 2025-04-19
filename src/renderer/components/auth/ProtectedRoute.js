import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isPasswordProtected, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If password protection is enabled but user is not authenticated
  if (isPasswordProtected && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no password protection or user is authenticated
  return children;
}; 