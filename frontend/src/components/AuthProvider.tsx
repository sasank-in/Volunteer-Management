import React, { useEffect } from 'react';
import { useAuthStore } from '@store/index';
import apiService from '@services/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * On boot, attempt a silent refresh. If the HttpOnly refresh cookie is valid
 * the server returns a fresh access token + user; otherwise the user lands
 * unauthenticated and is sent to /login by route guards.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setAuthenticated, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    const initializeAuth = async () => {
      try {
        const response = await apiService.refreshToken();
        if (cancelled) return;
        setUser(response.user);
        setAuthenticated(true);
      } catch {
        if (cancelled) return;
        setAuthenticated(false);
      } finally {
        if (cancelled) return;
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, [setUser, setAuthenticated, setLoading, setInitialized]);

  return <>{children}</>;
};
