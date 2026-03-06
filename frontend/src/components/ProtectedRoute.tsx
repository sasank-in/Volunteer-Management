import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, requiredRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('[ProtectedRoute] Render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', !!user);

  if (isLoading) {
    console.log('[ProtectedRoute] Loading, showing spinner');
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated or no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    console.log('[ProtectedRoute] User role', user.role, 'does not match required role', requiredRole);
    return <Navigate to="/events" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    console.log('[ProtectedRoute] User role', user.role, 'not in required roles', requiredRoles);
    return <Navigate to="/events" replace />;
  }

  console.log('[ProtectedRoute] All checks passed, showing children');
  return <>{children}</>;
};

export default ProtectedRoute;
