'use client';

import { PropsWithChildren, useEffect, createContext, useContext } from 'react';
import { AuthProvider as OidcProvider, useAuth as useOidcAuth } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { LoginTrap } from './LoginTrap';

type AuthProviderProps = PropsWithChildren;

/**
 * Check if authentication is enabled (static at build time)
 */
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';

/**
 * Auth context type
 */
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  error: any;
  signinRedirect: () => Promise<void>;
  signoutRedirect: () => Promise<void>;
  signinSilent: () => Promise<void>;
  removeUser: () => Promise<void>;
};

/**
 * Create a context for auth that's always available
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Mock auth object for when authentication is disabled
 */
const mockAuth: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  signinRedirect: () => Promise.resolve(),
  signoutRedirect: () => Promise.resolve(),
  signinSilent: () => Promise.resolve(),
  removeUser: () => Promise.resolve(),
};

/**
 * Component that provides auth context from OIDC
 */
function AuthContextProvider({ children }: PropsWithChildren) {
  // This is only rendered when inside OidcProvider, so useOidcAuth is safe
  const oidcAuth = useOidcAuth();
  
  const authValue: AuthContextType = {
    isAuthenticated: oidcAuth.isAuthenticated,
    isLoading: oidcAuth.isLoading,
    user: oidcAuth.user,
    error: oidcAuth.error || null,
    signinRedirect: oidcAuth.signinRedirect,
    signoutRedirect: oidcAuth.signoutRedirect,
    signinSilent: async () => {
      await oidcAuth.signinSilent();
    },
    removeUser: oidcAuth.removeUser,
  };
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  // If authentication is disabled, provide mock auth context
  if (!AUTH_ENABLED) {
    console.log('[AUTH] Authentication is DISABLED in frontend');
    return (
      <AuthContext.Provider value={mockAuth}>
        {children}
      </AuthContext.Provider>
    );
  }

  // OIDC configuration using Next.js environment variables
  const oidcConfig = {
    authority: process.env.NEXT_PUBLIC_AUTH_AUTHORITY || 'http://localhost:8080/realms/invoice-management',
    client_id: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || 'invoice-frontend',
    redirect_uri: typeof window !== 'undefined' 
      ? window.location.origin + (process.env.NEXT_PUBLIC_AUTH_REDIRECT_PATH || '/') 
      : 'http://localhost:3000/',
    post_logout_redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    response_type: 'code',
    scope: 'openid profile email',
    loadUserInfo: true,
    userStore: typeof window !== "undefined" && new WebStorageStateStore({ store: window.localStorage }),
    // Enable automatic silent token renewal
    automaticSilentRenew: true,
    // Monitor session state
    monitorSession: true,
    onSigninCallback: () => {
      // Remove the query parameters from the URL after login
      if (typeof window !== 'undefined') {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    },
  };

  return (
    <OidcProvider {...oidcConfig}>
      <AuthContextProvider>
        <AuthMonitor>
          <LoginTrap>{children}</LoginTrap>
        </AuthMonitor>
      </AuthContextProvider>
    </OidcProvider>
  );
}

/**
 * Internal component that monitors authentication state on window focus
 */
function AuthMonitor({ children }: PropsWithChildren) {
  const auth = useOidcAuth();

  useEffect(() => {
    const handleWindowFocus = async () => {
      // Skip if not authenticated or still loading
      if (!auth.isAuthenticated || auth.isLoading) {
        return;
      }

      // Check if user and token exist
      if (!auth.user) {
        return;
      }

      // Check if the token has expired
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const expiresAt = auth.user.expires_at;

      if (expiresAt && now >= expiresAt) {
        console.log('Token expired, attempting silent renewal...');
        try {
          // Try to silently renew the token
          await auth.signinSilent();
        } catch (error) {
          console.error('Silent token renewal failed:', error);
          // Remove the expired user from state
          await auth.removeUser();
        }
      }
    };

    // Add event listener for window focus
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [auth]);

  return <>{children}</>;
}

/**
 * Hook to get auth context - always calls hooks unconditionally
 * Uses our custom AuthContext which is always provided (with mock when disabled)
 */
export const useAuth = (): AuthContextType => {
  // Always call useContext unconditionally
  const context = useContext(AuthContext);
  
  // This should never be null since we always provide the context
  // But TypeScript needs this check
  if (!context) {
    return mockAuth;
  }
  
  return context;
};

/**
 * Generate the account management URL for the current authentication provider
 */
export function getAccountManagementUrl(): string | null {
  if (!AUTH_ENABLED) {
    return null;
  }
  
  const authority = process.env.NEXT_PUBLIC_AUTH_AUTHORITY;
  const clientId = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID;
  const referrerUri = typeof window !== 'undefined' ? window.location.origin : '';
  
  if (authority && clientId) {
    return `${authority}/account?referrer=${clientId}&referrer_uri=${encodeURIComponent(referrerUri)}`;
  }
  return null;
}
