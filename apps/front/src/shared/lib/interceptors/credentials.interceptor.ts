import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '@/shared/api/session.service';

/**
 * HTTP interceptor that adds authentication token to all requests
 * This enables token-based authentication by including the JWT token
 * stored in localStorage with every HTTP request made through Angular's HttpClient
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from SessionService (single source of truth)
  const sessionService = inject(SessionService);
  const token = sessionService.token();

  // Only add Authorization header if token exists
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
