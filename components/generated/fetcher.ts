import config from '../config'

/**
 * Get the current authentication token from localStorage
 * This reads the OIDC user session and extracts the access token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if auth is enabled
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
  if (!authEnabled) {
    return null;
  }

  try {
    // Get OIDC user from localStorage
    const oidcStorageKey = `oidc.user:${process.env.NEXT_PUBLIC_AUTH_AUTHORITY}:${process.env.NEXT_PUBLIC_AUTH_CLIENT_ID}`;
    const oidcUserJson = localStorage.getItem(oidcStorageKey);
    
    if (!oidcUserJson) {
      return null;
    }

    const oidcUser = JSON.parse(oidcUserJson);
    return oidcUser.access_token || null;
  } catch (error) {
    console.error('[Fetcher] Error getting auth token:', error);
    return null;
  }
}

export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables
) {
  return async (): Promise<TData> => {
    // Get authentication token
    const token = getAuthToken();
    
    // Build headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token is available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${config.apiURL}/`, {
      method: "POST",
      body: JSON.stringify({ query, variables }),
      headers,
    });

    const json = await res.json();

    if (json.errors?.length) {
      console.error("Graphql Error:", {errors: json.errors }, query, variables);
      
      // Check for authentication errors
      const hasAuthError = json.errors.some((error: any) => 
        error.message?.includes('Unauthorized') || 
        error.message?.includes('Authentication')
      );
      
      if (hasAuthError) {
        console.warn('[Fetcher] Authentication error detected. User may need to log in again.');
      }
    }
    const { data } = json

    return data;
  };
}
