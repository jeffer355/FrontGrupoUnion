import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // Usamos template en línea para asegurar que se aplique el cambio visual
  template: `
    <div class="layout-wrapper">
      <div class="sidebar sidebar-admin" [class.active]="isSidebarActive" id="sidebar">
        <div>
          <div class="sidebar-header">
            <span>Grupo Unión</span>
          </div>

          <div class="profile-info">
            <img [src]="adminPhoto || 'assets/images/user-avatar.webp'" 
                 alt="Foto perfil" 
                 style="width: 100px; height: 100px; border-radius: 20px; object-fit: cover; margin-bottom: 10px; background-color: #eee; border: 2px solid rgba(255,255,255,0.2);">
                 
            <h3>{{ adminName }}</h3>
            <a href="javascript:void(0)" style="cursor: default; color: rgba(255,255,255,0.8); text-decoration: none;">
                {{ adminArea }}
            </a>
          </div>

          <nav>
            <ul>
              <li><a routerLink="/admin/home" routerLinkActive="active" class="nav-link"><i class="fas fa-home"></i> Principal</a></li>
              <li><a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-link"><i class="fas fa-users"></i> Usuarios</a></li>
              <li><a routerLink="/admin/areas" routerLinkActive="active" class="nav-link"><i class="fas fa-building"></i> Áreas</a></li>
              <li><a routerLink="/admin/empleados" routerLinkActive="active" class="nav-link"><i class="fas fa-user-tie"></i> Empleados</a></li>
              <li><a href="javascript:void(0)" class="nav-link"><i class="fas fa-clipboard-check"></i> Asistencias</a></li>
            </ul>
          </nav>
        </div>

        <div>
          <button (click)="logout()" class="logout-button">
            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </div>

      <div class="main-content">
        
        <div class="top-bar">
          <div class="top-bar-left">
            <button class="menu-toggle" (click)="toggleSidebar()">&#9776;</button>
            <h1 class="top-bar-title">PANEL ADMINISTRATIVO</h1>
          </div>
          <div class="top-bar-right">
            <span class="profile-name">Admin</span>
            <span class="bell-icon">🔔</span>
          </div>
        </div>

        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isSidebarActive: boolean = false;
  adminName: string = 'Cargando...';
  adminArea: string = '';
  adminPhoto: string | null = null; 

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAdminData();
    // Suscripción para cambios en tiempo real
    this.dashboardService.currentAdminPhoto$.subscribe(photoUrl => {
      if (photoUrl) {
        this.adminPhoto = photoUrl;
        this.cdr.detectChanges();
      }
    });
  }

  loadAdminData() {
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        this.adminName = data.nombreCompleto || 'Administrador';
        this.adminArea = data.departamento || 'Administración';
        if (data.fotoUrl) { this.adminPhoto = data.fotoUrl; }
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando admin data', err);
        this.adminName = 'Admin Offline';
        this.adminArea = 'Sin conexión';
        this.cdr.detectChanges();
      }
    });
  }

  toggleSidebar() { this.isSidebarActive = !this.isSidebarActive; }
  logout() { this.authService.logout(); }
}