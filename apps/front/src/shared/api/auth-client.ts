import { createAuthClient } from 'better-auth/client';
export const authClient = createAuthClient({
  baseURL: _ENV.NG_BACKEND_URL,
  fetchOptions: {
    onError: (error) => {
      console.error('Auth error:', error);
    },
  },
});
