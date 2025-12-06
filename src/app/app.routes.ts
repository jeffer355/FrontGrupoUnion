import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard'; // Asegúrate de importar el guard

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // --- RUTAS PROTEGIDAS ---
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] // Protección genérica
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' } // Solo ADMIN pasa aquí
  },
  {
    path: 'empleado-dashboard',
    loadComponent: () => import('./empleado-dashboard/empleado-dashboard.component').then(m => m.EmpleadoDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'EMPLEADO' } // Solo EMPLEADO pasa aquí
  }
];