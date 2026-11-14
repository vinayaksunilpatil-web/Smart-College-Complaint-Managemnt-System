import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Authenticating user session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role?.toLowerCase())) {
    // Redirect to respective home dashboard based on role
    const redirectMap = {
      student: '/student/dashboard',
      staff: '/staff/dashboard',
      admin: '/admin/dashboard'
    };
    return <Navigate to={redirectMap[user.role?.toLowerCase()] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
