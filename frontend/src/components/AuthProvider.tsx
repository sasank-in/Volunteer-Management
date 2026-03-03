import React, { useEffect } from 'react';
import { useAuthStore } from '@store/index';
import apiService from '@services/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider: Initializes authentication once when the app boots
 * This ensures auth state is set up BEFORE any routes are rendered
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, isAuthenticated, setUser, setAuthenticated, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthProvider] Starting authentication initialization');
      
      try {
        const token = localStorage.getItem('accessToken');
        console.log('[AuthProvider] Token in localStorage:', !!token);
        
        // Case 1: Have token and user already persisted (from previous session)
        if (token && user) {
          console.log('[AuthProvider] Have token and persisted user - already authenticated');
          setAuthenticated(true);
        }
        // Case 2: Have token but no user - fetch profile
        else if (token && !user) {
          console.log('[AuthProvider] Have token but no user in store - fetching profile');
          try {
            const profile = await apiService.getProfile();
            console.log('[AuthProvider] Profile fetched successfully:', profile.email);
            setUser(profile);
            setAuthenticated(true);
          } catch (error) {
            console.error('[AuthProvider] Failed to fetch profile with token:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setAuthenticated(false);
          }
        }
        // Case 3: No token - not authenticated
        else {
          console.log('[AuthProvider] No token found - not authenticated');
          setAuthenticated(false);
        }
      } finally {
        console.log('[AuthProvider] Initialization complete - setting loading to false');
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once on mount

  return <>{children}</>;
};
