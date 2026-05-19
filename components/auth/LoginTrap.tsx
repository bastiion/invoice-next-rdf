'use client';

import { PropsWithChildren, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Box, Button } from '@mui/joy';
import { useAuth } from './AuthContext';
import {useTranslations} from 'next-intl';

/**
 * Check if authentication is enabled (static at build time)
 */
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';

/**
 * Login Trap component
 * When authentication is enabled, shows only a "Log In" button
 * in the center of the screen if user is not authenticated.
 * Blocks access to the rest of the application until login.
 */
export function LoginTrap({ children }: PropsWithChildren) {
  const t = useTranslations('Auth');
  // Always call hooks unconditionally (before any early returns)
  const auth = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Handle login with path persistence (always define, even if not used)
  const handleLogin = useCallback(() => {
    // Store current location (pathname + query params) for redirect after login
    const currentPath = searchParams?.toString()
      ? `${pathname ?? '/'}?${searchParams.toString()}`
      : (pathname ?? '/');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('preLoginPath', currentPath);
    }
    
    // Initiate OIDC sign in
    auth.signinRedirect();
  }, [auth, pathname, searchParams]);
  
  // If auth is disabled, show children directly
  if (!AUTH_ENABLED) {
    return <>{children}</>;
  }
  
  // Show loading state (don't show trap while loading)
  if (auth.isLoading) {
    return <>{children}</>;
  }
  
  // If not authenticated, show login trap
  if (!auth.isAuthenticated) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.body',
          zIndex: 9999,
        }}
      >
        <Button
          size="lg"
          variant="solid"
          color="primary"
          onClick={handleLogin}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
          }}
        >
          {t('logIn')}
        </Button>
      </Box>
    );
  }
  
  // User is authenticated, show children
  return <>{children}</>;
}

