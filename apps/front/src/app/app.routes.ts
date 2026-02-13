import { LoginPage, RegisterPage } from '@/pages/auth';
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@/shared/lib';
import { AuthLayout, AuthenticatedLayout } from '@/shared/ui';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        component: LoginPage,
      },
      {
        path: 'register',
        component: RegisterPage,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'home',
    component: AuthenticatedLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('@/pages/home').then((m) => m.HomePage),
      },
    ],
  },
];
