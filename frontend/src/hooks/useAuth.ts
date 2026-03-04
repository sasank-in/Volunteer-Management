import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiService from '@services/api';
import { UserAccount } from '@store/../types';

/**
 * useAuth: Returns authentication state and methods
 * Authentication is initialized by AuthProvider at app boot
 * This hook just provides access to the auth state
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
    }
    logout();
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    setUser,
  };
};

export const useProfile = (): UseQueryResult<UserAccount> => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRequireAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
};

export const useRequireRole = (requiredRole: string) => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== requiredRole)) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, requiredRole, navigate]);

  return { hasAccess: user?.role === requiredRole, isLoading };
};
