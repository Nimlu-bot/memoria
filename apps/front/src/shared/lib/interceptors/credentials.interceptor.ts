import { HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP interceptor that adds credentials to all requests
 * This enables cookie-based authentication by including credentials (cookies)
 * with every HTTP request made through Angular's HttpClient
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedRequest = req.clone({
    withCredentials: true,
  });

  return next(clonedRequest);
};
