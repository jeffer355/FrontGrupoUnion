import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'empleado-dashboard',
    loadComponent: () => import('./empleado-dashboard/empleado-dashboard.component').then(m => m.EmpleadoDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'EMPLEADO' }
  },
  // --- AQUI ESTA EL CAMBIO IMPORTANTE PARA ADMIN ---
  {
    path: 'admin',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        { path: 'home', loadComponent: () => import('./admin-dashboard/components/admin-home/admin-home.component').then(m => m.AdminHomeComponent) },
        { path: 'usuarios', loadComponent: () => import('./admin-dashboard/components/admin-usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
        { path: 'areas', loadComponent: () => import('./admin-dashboard/components/admin-areas/admin-areas.component').then(m => m.AdminAreasComponent) },
        { path: 'empleados', loadComponent: () => import('./admin-dashboard/components/admin-empleados/admin-empleados.component').then(m => m.AdminEmpleadosComponent) }
    ]
  }
];