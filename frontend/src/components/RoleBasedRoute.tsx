import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import type { UserRole } from '../types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
