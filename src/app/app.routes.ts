import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  // Redirección inicial
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
  // Rutas de Autenticación
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // --- PANEL EMPLEADO ---
  {
    path: 'empleado-dashboard',
    loadComponent: () => import('./empleado-dashboard/empleado-dashboard.component').then(m => m.EmpleadoDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'EMPLEADO' }
  },

  // --- PANEL ADMINISTRADOR ---
  {
    path: 'admin',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        
        // Vista Principal (Dashboard con tarjetas)
        { path: 'home', loadComponent: () => import('./admin-dashboard/components/admin-home/admin-home.component').then(m => m.AdminHomeComponent) },
        
        // Gestión de Usuarios
        { path: 'usuarios', loadComponent: () => import('./admin-dashboard/components/admin-usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
        
        // Gestión de Áreas
        { path: 'areas', loadComponent: () => import('./admin-dashboard/components/admin-areas/admin-areas.component').then(m => m.AdminAreasComponent) },
        
        // Gestión de Empleados
        { path: 'empleados', loadComponent: () => import('./admin-dashboard/components/admin-empleados/admin-empleados.component').then(m => m.AdminEmpleadosComponent) },
        
        // --- NUEVA RUTA DE REPORTES/ASISTENCIA ---
        { path: 'reportes', loadComponent: () => import('./admin-dashboard/components/reportes-asistencia/reportes-asistencia.component').then(m => m.ReportesAsistenciaComponent) }
    ]
  }
];