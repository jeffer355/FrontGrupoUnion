import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-wrapper">
      <div class="sidebar sidebar-admin" [class.active]="isSidebarActive" id="sidebar">
        <div>
          <div class="sidebar-header">
            <span>Grupo Unión</span>
          </div>

          <div class="profile-info">
            <img [src]="adminPhoto || 'assets/images/user-avatar.webp'" 
                 style="width: 100px; height: 100px; border-radius: 20px; object-fit: cover; margin-bottom: 10px; background-color: #eee; border: 2px solid rgba(255,255,255,0.2);">
            <h3>{{ adminName }}</h3>
            <a href="javascript:void(0)" style="cursor: default; color: rgba(255,255,255,0.8); text-decoration: none;">{{ adminArea }}</a>
          </div>

          <nav>
            <ul>
              <li><a routerLink="/admin/home" routerLinkActive="active" class="nav-link"><i class="fas fa-home"></i> Principal</a></li>
              <li><a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-link"><i class="fas fa-users"></i> Usuarios</a></li>
              <li><a routerLink="/admin/areas" routerLinkActive="active" class="nav-link"><i class="fas fa-building"></i> Áreas</a></li>
              <li><a routerLink="/admin/empleados" routerLinkActive="active" class="nav-link"><i class="fas fa-user-tie"></i> Empleados</a></li>
              <li><a routerLink="/admin/reportes" routerLinkActive="active" class="nav-link"><i class="fas fa-clipboard-check"></i> Asistencias</a></li>
              
              <div style="margin: 15px 0; border-top: 1px solid rgba(255,255,255,0.1);"></div>
              
              <li><a routerLink="/admin/boletas" routerLinkActive="active" class="nav-link"><i class="fas fa-receipt"></i> Boletas</a></li>
              <li><a routerLink="/admin/documentos" routerLinkActive="active" class="nav-link"><i class="fas fa-folder"></i> Documentos</a></li>
              <li><a routerLink="/admin/solicitudes" routerLinkActive="active" class="nav-link"><i class="fas fa-envelope-open-text"></i> Solicitudes</a></li>
            </ul>
          </nav>
        </div>

        <div>
          <button (click)="logout()" class="logout-button"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</button>
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

  constructor(private authService: AuthService, private dashboardService: DashboardService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        this.adminName = data.nombreCompleto || 'Administrador';
        this.adminArea = data.departamento || 'Administración';
        if (data.fotoUrl) { this.adminPhoto = data.fotoUrl; }
        this.cdr.detectChanges(); 
      }
    });
  }

  toggleSidebar() { this.isSidebarActive = !this.isSidebarActive; }
  logout() { this.authService.logout(); }
}