import { createAuthClient } from 'better-auth/client';

/**
 * Factory function to create an auth client with the correct base URL
 * This allows for runtime platform detection (web vs native)
 */
export function createMemoriaAuthClient(apiBaseUrl: string) {
  const cleanBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  const baseURL = `${cleanBaseUrl}/api/auth`;

  return createAuthClient({
    baseURL,
    fetchOptions: {
      // credentials: 'exclude', // Don't send cookies, we use token-based auth
      auth: {
        type: 'Bearer',
        token: () => {
          // Get the token from localStorage for Bearer token authentication (mobile/Capacitor)
          return typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
        },
      },
      onError: (error) => {
        console.error('Auth error:', error);
      },
    },
  });
}
