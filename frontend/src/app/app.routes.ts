import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.Register),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'suppliers',
    loadComponent: () => import('./suppliers/suppliers').then(m => m.Suppliers),
    canActivate: [authGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./admin/users/users').then(m => m.Users),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/supplier-types',
    loadComponent: () => import('./admin/supplier-types/supplier-types').then(m => m.SupplierTypes),
    canActivate: [authGuard, adminGuard],
  },
];
