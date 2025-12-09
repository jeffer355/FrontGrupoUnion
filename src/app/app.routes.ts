import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
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
        
        // Vistas existentes
        { path: 'home', loadComponent: () => import('./admin-dashboard/components/admin-home/admin-home.component').then(m => m.AdminHomeComponent) },
        { path: 'usuarios', loadComponent: () => import('./admin-dashboard/components/admin-usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
        { path: 'areas', loadComponent: () => import('./admin-dashboard/components/admin-areas/admin-areas.component').then(m => m.AdminAreasComponent) },
        { path: 'empleados', loadComponent: () => import('./admin-dashboard/components/admin-empleados/admin-empleados.component').then(m => m.AdminEmpleadosComponent) },
        { path: 'reportes', loadComponent: () => import('./admin-dashboard/components/reportes-asistencia/reportes-asistencia.component').then(m => m.ReportesAsistenciaComponent) },
        
        // --- NUEVAS RUTAS SEPARADAS (LO QUE PEDISTE) ---
        { path: 'boletas', loadComponent: () => import('./admin-dashboard/components/admin-boletas/admin-boletas.component').then(m => m.AdminBoletasComponent) },
        { path: 'documentos', loadComponent: () => import('./admin-dashboard/components/admin-documentos/admin-documentos.component').then(m => m.AdminDocumentosComponent) },
        { path: 'solicitudes', loadComponent: () => import('./admin-dashboard/components/admin-solicitudes/admin-solicitudes.component').then(m => m.AdminSolicitudesComponent) }
    ]
  }
];