import { createAuthClient } from 'better-auth/client';

// Use current origin + /api/auth path to match backend auth routes
// In development: http://localhost:4200/api/auth (proxied to http://localhost:4000/api/auth)
// In production: https://yourdomain.com/api/auth (configure nginx/reverse proxy)
const baseURL = typeof window !== 'undefined' ? `${window.location.origin}/api/auth` : '/api/auth';

export const authClient = createAuthClient({
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
