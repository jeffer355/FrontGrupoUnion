import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule 
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isSidebarActive: boolean = false;
   
  // Variables para mostrar en la vista
  adminName: string = 'Cargando...';
  
  // 1. VARIABLE AGREGADA PARA EL DEPARTAMENTO
  adminArea: string = ''; 

  stats = {
    users: 0,
    areas: 0,
    employees: 0,
    attendances: 0
  };

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef 
  ) { } 

  ngOnInit(): void {
      this.loadAdminData();
  }

  loadAdminData() {
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        console.log('Datos Admin recibidos:', data);
        
        this.adminName = data.nombreCompleto || 'Administrador'; // Fallback por seguridad
        
        // 2. ASIGNACIÓN DEL DEPARTAMENTO (AREA)
        // Si el backend no envía "departamento", mostrará "Administración" por defecto.
        this.adminArea = data.departamento || 'Administración';

        if(data.stats_users) this.stats.users = data.stats_users;
        if(data.stats_areas) this.stats.areas = data.stats_areas;
        
        // 3. FORZAR ACTUALIZACIÓN DE VISTA (IMPORTANTE)
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando admin data', err);
        this.adminName = 'Admin (Error)';
        this.adminArea = 'Sin conexión';
        this.cdr.detectChanges(); // Forzar actualización también en error
      }
    });
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  logout() {
    this.authService.logout();
  }
}