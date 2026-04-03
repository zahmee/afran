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
    path: 'sales',
    loadComponent: () => import('./sales/sales').then(m => m.Sales),
    canActivate: [authGuard],
  },
  {
    path: 'receipts',
    loadComponent: () => import('./receipts/receipts').then(m => m.Receipts),
    canActivate: [authGuard],
  },
  {
    path: 'return-entry',
    loadComponent: () => import('./return-entry/return-entry').then(m => m.ReturnEntry),
    canActivate: [authGuard],
  },
  {
    path: 'returns',
    loadComponent: () => import('./returns/returns').then(m => m.Returns),
    canActivate: [authGuard],
  },
  {
    path: 'returns/:id/edit',
    loadComponent: () => import('./returns/return-edit').then(m => m.ReturnEdit),
    canActivate: [authGuard],
  },
  {
    path: 'receipts/:id/edit',
    loadComponent: () => import('./receipts/receipt-edit').then(m => m.ReceiptEdit),
    canActivate: [authGuard],
  },
  {
    path: 'payments',
    loadComponent: () => import('./payments/payments').then(m => m.Payments),
    canActivate: [authGuard],
  },
  {
    path: 'suppliers',
    loadComponent: () => import('./suppliers/suppliers').then(m => m.Suppliers),
    canActivate: [authGuard],
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports').then(m => m.Reports),
    canActivate: [authGuard, adminGuard],
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
