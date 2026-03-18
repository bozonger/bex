import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import {loggedinGuard } from './core/guards/loggedin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'report',
    pathMatch: 'full'
  },
  { 
    path: 'login', 
    canActivate: [loggedinGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    canActivate: [loggedinGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'report', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/report.component').then(m => m.ReportComponent) 
  },
];
