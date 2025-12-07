import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. IMPORTAR ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isSidebarActive: boolean = false;
  adminName: string = 'Cargando...';
  adminArea: string = ''; // Inicialmente vacío para que salga el texto "Cargando..."

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef // 2. INYECTARLO AQUÍ
  ) { }

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData() {
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        // Asignamos los datos
        this.adminName = data.nombreCompleto || 'Administrador';
        this.adminArea = data.departamento || 'Administración';
        
        // 3. ¡EL FIX! FORZAMOS A ANGULAR A PINTAR LOS DATOS YA
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.adminName = 'Admin Offline';
        this.adminArea = 'Sin conexión';
        this.cdr.detectChanges(); // Forzamos también en error
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