import { inject } from '@angular/core';
import {
  Router,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { SessionService } from '@/shared/api/session.service';

/**
 * Guard that protects routes requiring authentication
 * Validates session on server-side via cookie
 */
export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);

  try {
    if (!sessionService.session()) {
      return router.createUrlTree(['/auth/login']);
    }

    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return router.createUrlTree(['/auth/login']);
  }
};

/**
 * Guard that redirects authenticated users away from auth pages
 * Validates session on server-side via cookie
 */
export const noAuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);

  try {
    if (sessionService.session()) {
      return router.createUrlTree(['/home']);
    }

    return true;
  } catch (error) {
    // If session check fails, allow access to auth pages
    return true;
  }
};
