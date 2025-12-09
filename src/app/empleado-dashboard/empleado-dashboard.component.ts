import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service'; // Asegúrate ruta correcta

interface EmpleadoData {
  nombres: string;
  nombreCompleto: string;
  cargo: string;
  email: string;
  telefono: string;
  departamento?: string;
  fotoUrl?: string; 
}

@Component({
  selector: 'app-empleado-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-wrapper">
      <div class="sidebar sidebar-employee" [class.active]="isSidebarActive" id="sidebar">
        <div>
          <div class="sidebar-header">
            <span>Grupo Unión</span>
          </div>

          <div class="profile-info">
            <img [src]="empleado?.fotoUrl || 'assets/images/user-avatar.webp'" 
                 alt="Foto de perfil" 
                 style="width: 100px; height: 100px; border-radius: 20px; object-fit: cover; margin-bottom: 10px; background-color: #eee; border: 2px solid rgba(255,255,255,0.2);">
                 
            <h3>{{ empleado?.nombres || 'Usuario' }}</h3>
            
            <a href="javascript:void(0)" style="cursor: default; text-decoration: none; color: rgba(255,255,255,0.7);">
               {{ empleado?.departamento || 'Sin Área Asignada' }}
            </a>
          </div>

          <nav>
            <ul>
              <li><a routerLink="/empleado-dashboard" class="nav-link active"><i class="fas fa-home"></i> Principal</a></li>
              <li><a routerLink="/empleado/asistencia" class="nav-link"><i class="fas fa-clock"></i> Asistencia</a></li>
              <li><a href="javascript:void(0)" class="nav-link"><i class="fas fa-receipt"></i> Boletas</a></li>
              <li><a href="javascript:void(0)" class="nav-link"><i class="fas fa-file-alt"></i> Documentos</a></li>
              <li><a href="javascript:void(0)" class="nav-link"><i class="fas fa-envelope-open-text"></i> Solicitudes</a></li>
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
            <h1 class="top-bar-title">DASHBOARD PRINCIPAL</h1>
          </div>

          <div class="top-bar-right">
            <span class="profile-name">{{ usuario?.username || 'empleado' }}</span>
            <span class="bell-icon">🔔</span>
          </div>
        </div>

        <div class="page-content">
          
          <div class="profile-card">
            <div class="d-flex align-items-center flex-grow-1 profile-content-wrapper">
              <div class="profile-avatar-container" style="overflow: hidden; border-radius: 20px; width: 120px; height: 120px;">
                <img [src]="empleado?.fotoUrl || 'assets/images/user-avatar.webp'" 
                      alt="Avatar" 
                      style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div class="profile-info-text">
                <h2>{{ empleado?.nombreCompleto || 'NOMBRE EMPLEADO' }}</h2>
                <p class="role" *ngIf="empleado?.cargo">{{ empleado?.cargo }}</p>
                <p class="role" *ngIf="!empleado?.cargo" style="font-style: italic; color: #dc3545;">Rol no Definido</p>
                <p class="contact">{{ empleado?.email || '' }} | {{ empleado?.telefono || '' }}</p>

                <a href="javascript:void(0)" class="btn btn-sm edit-profile-button">
                  <i class="fas fa-pencil-alt me-2"></i> Ver perfil
                </a>
              </div>
            </div>
            <div class="decorative-image-wrapper"></div>
          </div>

          </div>
      </div>
    </div>
  `,
  styleUrls: ['./empleado-dashboard.component.css']
})
export class EmpleadoDashboardComponent implements OnInit {

  empleado: EmpleadoData | null = null;
  usuario: { username: string } | null = null;
  cumpleanosList: any[] = [];
  isSidebarActive: boolean = false;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    const username = this.authService.getUserName();
    if (username) this.usuario = { username: username };

    this.dashboardService.getEmpleadoData().subscribe({
      next: (data) => {
        this.empleado = {
          nombres: data.nombres,
          nombreCompleto: data.nombres, 
          cargo: data.cargo,
          email: data.email,
          telefono: data.telefono,
          departamento: data.departamento,
          fotoUrl: data.fotoUrl 
        };
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.empleado = { nombres: 'Usuario Offline', nombreCompleto: 'Usuario Offline', cargo: 'Sin conexión', email: 'error@sistema', telefono: '000-000', departamento: 'Desconectado', fotoUrl: undefined };
        this.cdr.detectChanges(); 
      }
    });
  }

  logout(): void { this.authService.logout(); }
  toggleSidebar(): void { this.isSidebarActive = !this.isSidebarActive; }
}