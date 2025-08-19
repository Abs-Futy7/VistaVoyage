"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { authService, User } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const lastAuthCheck = useRef<number>(0);
  const authCheckCache = useRef<{ authenticated: boolean; user: User | null } | null>(null);

  // Memoize auth check to prevent unnecessary API calls
  const checkAuthStatus = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    // Only check auth every 30 seconds unless forced
    if (!force && now - lastAuthCheck.current < 30000 && authCheckCache.current) {
      setIsAuthenticated(authCheckCache.current.authenticated);
      setUser(authCheckCache.current.user);
      setIsLoading(false);
      return;
    }

    try {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Only fetch user profile if we don't have it cached or if forced
        if (!authCheckCache.current?.user || force) {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
          authCheckCache.current = { authenticated, user: userProfile };
        } else {
          setUser(authCheckCache.current.user);
        }
      } else {
        setUser(null);
        authCheckCache.current = { authenticated: false, user: null };
      }
      
      lastAuthCheck.current = now;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      authCheckCache.current = { authenticated: false, user: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus(true); // Force initial check

    // Listen for storage changes (login/logout events) with debouncing
    let timeoutId: NodeJS.Timeout;
    const handleStorageChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        checkAuthStatus(true);
      }, 100); // Debounce for 100ms
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const authResponse = await authService.login({ email, password });
      setUser(authResponse.user);
      setIsAuthenticated(true);
      return authResponse;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    passport: string;
  }) => {
    try {
      setIsLoading(true);
      const authResponse = await authService.register(userData);
      setUser(authResponse.user);
      setIsAuthenticated(true);
      return authResponse;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      authCheckCache.current = { authenticated: false, user: null };
      
      // Show success message
      console.log('✅ Successfully logged out and cleared all tokens');
      
      // Use Next.js router for better performance
      if (typeof window !== 'undefined') {
        const { useRouter } = await import('next/navigation');
        // Force reload to clear all cached data
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      authCheckCache.current = { authenticated: false, user: null };
      
      // Redirect to home page even if logout API fails
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refetch: () => checkAuthStatus(true) // Force refresh when called
  };
}
