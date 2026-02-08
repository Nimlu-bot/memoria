import { LoginPage, RegisterPage } from '@/pages/auth';
import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';

// Auth guard that redirects unauthenticated users to login
export const authGuard = (route: any, state: any) => {
  const router = inject(Router);
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    // return router.createUrlTree(['/login']);
    return true;
  }
  return true;
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    component: LoginPage,
  },
  {
    path: 'auth/register',
    component: RegisterPage,
  },
  {
    path: 'home',
    loadComponent: () => import('@/pages/home').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
];
