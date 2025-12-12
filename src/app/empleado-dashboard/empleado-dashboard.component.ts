import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service'; 

// Componentes Hijos
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
              <li><a href="javascript:void(0)" (click)="setView('HOME')" class="nav-link" [class.active]="currentView === 'HOME'"><i class="fas fa-home"></i> Principal</a></li>
              <li><a href="javascript:void(0)" (click)="setView('ASISTENCIA')" class="nav-link" [class.active]="currentView === 'ASISTENCIA'"><i class="fas fa-clock"></i> Asistencia</a></li>
              <li><a href="javascript:void(0)" (click)="setView('BOLETAS')" class="nav-link" [class.active]="currentView === 'BOLETAS'"><i class="fas fa-receipt"></i> Boletas</a></li>
              <li><a href="javascript:void(0)" (click)="setView('DOCS')" class="nav-link" [class.active]="currentView === 'DOCS'"><i class="fas fa-file-alt"></i> Documentos</a></li>
              <li><a href="javascript:void(0)" (click)="setView('SOLICITUDES')" class="nav-link" [class.active]="currentView === 'SOLICITUDES'"><i class="fas fa-envelope-open-text"></i> Solicitudes</a></li>
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
             <div class="dashboard-home fade-in">
                
                <div class="profile-banner">
                    <div class="profile-details">
                        <h2>{{ empleado?.nombres }}</h2>
                        <p class="profile-role">{{ empleado?.cargo || 'Colaborador' }}</p>
                        <p class="profile-contact">{{ empleado?.email || 'email@grupounion.com' }} | {{ empleado?.telefono || '+51 999 999 999' }}</p>
                        <button class="edit-profile-btn"><i class="fas fa-pen"></i> Ver perfil</button>
                    </div>
                    <div class="profile-image-container">
                        <img src="https://i.ibb.co/tT1M3GQB/img122.png" alt="Profile Illustration" class="profile-illustration">
                    </div>
                </div>

                <div class="widgets-container">
                    <div class="widget-card policy-widget">
                        <div class="widget-header">
                            <h4><i class="fas fa-bullhorn" style="color: #003057;"></i> Notas y Políticas</h4>
                        </div>
                        <div class="widget-body scrollable-list">
                            <ul class="policy-list">
                                <li *ngFor="let p of policies" class="policy-item">
                                    <div class="policy-icon" [style.color]="p.color" [style.background-color]="getLightColor(p.color)">
                                        <i class="fas" [ngClass]="p.icono"></i>
                                    </div>
                                    <div class="policy-content">
                                        <span class="policy-title">{{ p.titulo }}</span>
                                        <p class="policy-text">{{ p.mensaje }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="widget-card birthday-widget">
                        <div class="widget-header">
                            <h4><i class="fas fa-birthday-cake" style="color: #e91e63;"></i> Cumpleaños</h4>
                        </div>
                        <div class="widget-body scrollable-list">
                            <ul class="birthday-list">
                                <li *ngFor="let b of birthdays" class="birthday-item">
                                    <div class="b-avatar">
                                        <img *ngIf="b.fotoUrl" [src]="b.fotoUrl" alt="foto">
                                        <span *ngIf="!b.fotoUrl">{{ b.nombres.charAt(0) }}</span>
                                    </div>
                                    <div class="b-info">
                                        <span class="b-name">{{ b.nombres }}</span>
                                        <span class="b-role">{{ b.cargo }}</span>
                                    </div>
                                    <div class="b-date">
                                        <span class="day">{{ b.dia }}</span>
                                        <span class="month">{{ getMonthName() }}</span>
                                    </div>
                                </li>
                                <li *ngIf="birthdays.length === 0" class="no-data">
                                    No hay cumpleaños este mes.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
             </div>
          </ng-container>

          <ng-container *ngIf="currentView === 'ASISTENCIA'"><app-asistencia></app-asistencia></ng-container>
          <ng-container *ngIf="currentView === 'BOLETAS'"><app-empleado-boletas></app-empleado-boletas></ng-container>
          <ng-container *ngIf="currentView === 'DOCS'"><app-empleado-docs></app-empleado-docs></ng-container>
          <ng-container *ngIf="currentView === 'SOLICITUDES'"><app-empleado-solicitudes></app-empleado-solicitudes></ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./empleado-dashboard.component.css'],
  styles: [`
    /* ESTILOS ESPECÍFICOS PARA LOS WIDGETS DEL HOME */
    
    .dashboard-home { max-width: 1200px; margin: 0 auto; }
    
    /* --- NUEVA TARJETA DE PERFIL --- */
    .profile-banner {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        padding: 30px;
        margin-bottom: 25px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #f0f0f0;
    }
    .profile-details h2 {
        color: #003057; margin: 0 0 10px 0; font-size: 1.8rem;
    }
    .profile-role { color: #555; font-weight: 600; margin: 0 0 5px 0; }
    .profile-contact { color: #777; font-size: 0.9rem; margin: 0 0 20px 0; }
    
    .edit-profile-btn {
        background-color: #f3e5f5; color: #7b1fa2;
        border: none; padding: 10px 20px; border-radius: 20px;
        font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
        transition: background-color 0.2s;
    }
    .edit-profile-btn:hover { background-color: #e1bee7; }
    
    .profile-image-container {
        flex-shrink: 0;
    }
    .profile-illustration {
        max-width: 300px; height: auto;
    }

    /* --- CONTENEDOR DE WIDGETS --- */
    .widgets-container {
        display: grid;
        grid-template-columns: 2fr 1fr; /* Políticas 66%, Cumpleaños 33% */
        gap: 25px;
        align-items: start;
    }

    /* TARJETA GENÉRICA (Base compartida) */
    .widget-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        overflow: hidden;
        border: 1px solid #f0f0f0;
        height: 400px; /* Altura fija para alineación */
        display: flex;
        flex-direction: column;
    }

    .widget-header {
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
        background: #fff;
    }
    .widget-header h4 { margin: 0; font-size: 1rem; color: #333; font-weight: 700; }
    
    .widget-body { flex-grow: 1; padding: 0; overflow-y: auto; }

    /* --- WIDGET CUMPLEAÑOS (Copiado del Admin) --- */
    .birthday-list { list-style: none; padding: 0; margin: 0; }
    .birthday-item { display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid #f9f9f9; }
    .birthday-item:hover { background-color: #fcfcfc; }
    
    .b-avatar {
        width: 40px; height: 40px; border-radius: 50%;
        background-color: #e0e7ff; color: #4338ca;
        display: flex; justify-content: center; align-items: center;
        font-weight: bold; margin-right: 12px; overflow: hidden; flex-shrink: 0;
    }
    .b-avatar img { width: 100%; height: 100%; object-fit: cover; }
    
    .b-info { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
    .b-name { font-size: 0.9rem; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .b-role { font-size: 0.75rem; color: #888; }
    
    .b-date {
        text-align: center; background: #fce4ec; color: #c2185b;
        padding: 5px 10px; border-radius: 8px; min-width: 50px; flex-shrink: 0;
    }
    .b-date .day { display: block; font-weight: bold; font-size: 1rem; line-height: 1; }
    .b-date .month { display: block; font-size: 0.6rem; text-transform: uppercase; }

    /* --- WIDGET POLÍTICAS (Nuevo Estilo) --- */
    .policy-list { list-style: none; padding: 20px; margin: 0; display: flex; flex-direction: column; gap: 15px; }
    .policy-item {
        display: flex; align-items: flex-start; gap: 15px;
        background: #fff; border: 1px solid #eee;
        border-radius: 10px; padding: 15px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        transition: transform 0.2s;
    }
    .policy-item:hover { transform: translateY(-2px); box-shadow: 0 5px 10px rgba(0,0,0,0.05); }

    .policy-icon {
        width: 40px; height: 40px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.2rem; flex-shrink: 0;
    }
    .policy-content { display: flex; flex-direction: column; gap: 4px; }
    .policy-title { font-weight: 700; color: #333; font-size: 0.95rem; }
    .policy-text { font-size: 0.85rem; color: #666; margin: 0; line-height: 1.4; }

    .no-data { text-align: center; color: #999; padding: 20px; font-style: italic; }
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* RESPONSIVE */
    @media (max-width: 900px) {
        .profile-banner { flex-direction: column; text-align: center; }
        .profile-image-container { margin-top: 20px; }
        .edit-profile-btn { margin: 0 auto; }
        .widgets-container { grid-template-columns: 1fr; }
        .widget-card { height: auto; max-height: 400px; }
    }
  `]
})
export class EmpleadoDashboardComponent implements OnInit {
  empleado: any = null;
  usuario: any = null;
  isSidebarActive = false;
  currentView: 'HOME'|'ASISTENCIA'|'BOLETAS'|'DOCS'|'SOLICITUDES' = 'HOME';

  // Datos para los widgets
  birthdays: any[] = [];
  policies: any[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    const u = this.authService.getUserName();
    if(u) this.usuario = { username: u };

    this.dashboardService.getEmpleadoData().subscribe({
      next: (d) => {
        this.empleado = d;
        // Aquí podrías asignar email/teléfono si vienen del backend
        // this.empleado.email = d.email;
        // this.empleado.telefono = d.telefono;
        this.cdr.detectChanges(); 
      }
    });

    // Cargar Widgets
    this.cargarWidgets();
  }

  cargarWidgets() {
    this.dashboardService.getEmployeeBirthdaysWidget().subscribe({
        next: (d) => { this.birthdays = d; this.cdr.detectChanges(); }
    });

    this.dashboardService.getPoliciesWidget().subscribe({
        next: (d) => { this.policies = d; this.cdr.detectChanges(); }
    });
  }

  setView(view: any) { 
      this.currentView = view; 
      this.cdr.detectChanges(); 
  }
  
  getTitle() { 
      const titles: any = { 'HOME': 'DASHBOARD PRINCIPAL', 'ASISTENCIA': 'REGISTRO DE ASISTENCIA', 'BOLETAS': 'MIS BOLETAS', 'DOCS': 'DOCUMENTOS', 'SOLICITUDES': 'SOLICITUDES' };
      return titles[this.currentView] || 'DASHBOARD'; 
  }
  
  logout() { this.authService.logout(); }
  toggleSidebar() { this.isSidebarActive = !this.isSidebarActive; }

  // Helpers para vista
  getMonthName(): string {
    const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    return months[new Date().getMonth()];
  }

  getLightColor(hex: string) {
      // Función simple para hacer el fondo más claro basado en el color del icono
      return hex + '15'; // Agrega transparencia (hex alpha)
  }
}