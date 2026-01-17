'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth, getAccountManagementUrl } from './AuthContext';

/**
 * Custom hook that manages the authentication flow with automatic path persistence.
 * Handles storing the current path before login and provides convenient login/logout methods.
 */
export function useAuthenticationFlow() {
  const auth = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Memoize the account management URL since it depends on environment variables
  const accountManagementUrl = useMemo(() => getAccountManagementUrl(), []);

  /**
   * Initiates the login flow and stores the current path for post-login redirect
   */
  const login = useCallback(() => {
    // Store current location (pathname + query params) for redirect after login
    const currentPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('preLoginPath', currentPath);
    }
    
    // Initiate OIDC sign in
    auth.signinRedirect();
  }, [auth, pathname, searchParams]);

  /**
   * Initiates the logout flow
   */
  const logout = useCallback(() => {
    auth.signoutRedirect();
  }, [auth]);

  return {
    // Auth state
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    error: auth.error,
    
    // Auth actions
    login,
    logout,
    
    // Account management
    accountManagementUrl,
    
    // Direct access to auth object if needed for advanced use cases
    auth,
  };
}

