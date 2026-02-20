import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Infer roles from path if not explicitly provided
  let requiredRoles = allowedRoles;
  if (!requiredRoles) {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/admin')) requiredRoles = ['admin'];
    if (path.startsWith('/student')) requiredRoles = ['student'];
  }

  if (requiredRoles && (!user || !requiredRoles.includes(user.role))) {
    // Redirect unauthorized users to their appropriate dashboard
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'student') return <Navigate to="/student-portal" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};