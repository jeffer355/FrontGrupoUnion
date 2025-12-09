import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service'; 

// Componentes
import { AsistenciaComponent } from './components/asistencia/asistencia.component';
import { EmpleadoBoletasComponent } from './components/boletas/boletas.component';
import { EmpleadoDocumentosComponent } from './components/documentos/documentos.component';
import { EmpleadoSolicitudesComponent } from './components/solicitudes/solicitudes.component';

@Component({
  selector: 'app-empleado-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AsistenciaComponent, EmpleadoBoletasComponent, EmpleadoDocumentosComponent, EmpleadoSolicitudesComponent],
  template: `
    <div class="layout-wrapper">
      <div class="sidebar sidebar-employee" [class.active]="isSidebarActive" id="sidebar">
        <div>
          <div class="sidebar-header">
            <span>Grupo Unión</span>
          </div>

          <div class="profile-info">
            <img [src]="empleado?.fotoUrl || 'assets/images/user-avatar.webp'" 
                 style="width: 100px; height: 100px; border-radius: 20px; object-fit: cover; margin-bottom: 10px; background-color: #eee; border: 2px solid rgba(255,255,255,0.2);">
            <h3>{{ empleado?.nombres || 'Usuario' }}</h3>
            <a href="javascript:void(0)" style="cursor: default; color: rgba(255,255,255,0.7);">
               {{ empleado?.departamento || 'Sin Área' }}
            </a>
          </div>

          <nav>
            <ul>
              <li>
                <a href="javascript:void(0)" (click)="setView('HOME')" class="nav-link" [class.active]="currentView === 'HOME'">
                  <i class="fas fa-home"></i> Principal
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" (click)="setView('ASISTENCIA')" class="nav-link" [class.active]="currentView === 'ASISTENCIA'">
                  <i class="fas fa-clock"></i> Asistencia
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" (click)="setView('BOLETAS')" class="nav-link" [class.active]="currentView === 'BOLETAS'">
                    <i class="fas fa-receipt"></i> Boletas
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" (click)="setView('DOCS')" class="nav-link" [class.active]="currentView === 'DOCS'">
                    <i class="fas fa-file-alt"></i> Documentos
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" (click)="setView('SOLICITUDES')" class="nav-link" [class.active]="currentView === 'SOLICITUDES'">
                    <i class="fas fa-envelope-open-text"></i> Solicitudes
                </a>
              </li>
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
            <h1 class="top-bar-title">{{ getTitle() }}</h1>
          </div>
          <div class="top-bar-right">
            <span class="profile-name">{{ usuario?.username }}</span>
            <span class="bell-icon">🔔</span>
          </div>
        </div>

        <div class="page-content">
          <ng-container *ngIf="currentView === 'HOME'">
             <div class="crud-container"><h2>Bienvenido, {{ empleado?.nombres }}</h2><p>Selecciona una opción del menú lateral.</p></div>
          </ng-container>

          <ng-container *ngIf="currentView === 'ASISTENCIA'"><app-asistencia></app-asistencia></ng-container>
          <ng-container *ngIf="currentView === 'BOLETAS'"><app-empleado-boletas></app-empleado-boletas></ng-container>
          <ng-container *ngIf="currentView === 'DOCS'"><app-empleado-docs></app-empleado-docs></ng-container>
          <ng-container *ngIf="currentView === 'SOLICITUDES'"><app-empleado-solicitudes></app-empleado-solicitudes></ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./empleado-dashboard.component.css']
})
export class EmpleadoDashboardComponent implements OnInit {
  empleado: any = null;
  usuario: any = null;
  isSidebarActive = false;
  currentView: 'HOME'|'ASISTENCIA'|'BOLETAS'|'DOCS'|'SOLICITUDES' = 'HOME';

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef // VITAL PARA LA ACTUALIZACIÓN
  ) {}

  ngOnInit() {
    const u = this.authService.getUserName();
    if(u) this.usuario = { username: u };

    this.dashboardService.getEmpleadoData().subscribe({
      next: (d) => {
        this.empleado = d;
        this.cdr.detectChanges(); 
      }
    });
  }

  // ESTA FUNCIÓN ES LA QUE ARREGLA EL DOBLE CLIC
  setView(view: any) { 
      this.currentView = view; 
      this.cdr.detectChanges(); // Forzar repintado de la pantalla
  }
  
  getTitle() { return this.currentView; }
  logout() { this.authService.logout(); }
  toggleSidebar() { this.isSidebarActive = !this.isSidebarActive; }
}