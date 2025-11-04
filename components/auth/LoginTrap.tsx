import { PropsWithChildren, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/joy';
import { useAuth } from './AuthContext';

/**
 * Login Trap component
 * When authentication is enabled, shows only a "Log In" button
 * in the center of the screen if user is not authenticated.
 * Blocks access to the rest of the application until login.
 */
export function LoginTrap({ children }: PropsWithChildren) {
  const auth = useAuth();
  const router = useRouter();
  
  // Check if authentication is enabled
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
  
  // If auth is disabled, show children directly
  if (!authEnabled) {
    return <>{children}</>;
  }
  
  // Show loading state (don't show trap while loading)
  if (auth.isLoading) {
    return <>{children}</>;
  }
  
  // Handle login with path persistence
  const handleLogin = useCallback(() => {
    // Store current location (pathname + query params) for redirect after login
    const currentPath = router.asPath;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('preLoginPath', currentPath);
    }
    
    // Initiate OIDC sign in
    auth.signinRedirect();
  }, [auth, router]);
  
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
          Log In
        </Button>
      </Box>
    );
  }
  
  // User is authenticated, show children
  return <>{children}</>;
}

