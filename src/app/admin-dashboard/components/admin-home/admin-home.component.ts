import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service'; // Asegúrate de importar el servicio

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="stats-cards-grid fade-in">
        <div class="stat-card card-users">
          <div class="card-kpi-number">{{ stats.users }}</div>
          <h3>Usuarios</h3>
          <a routerLink="/admin/usuarios">Ver detalles</a>
        </div>

        <div class="stat-card card-areas">
          <div class="card-kpi-number">{{ stats.areas }}</div>
          <h3>Áreas</h3>
          <a routerLink="/admin/areas">Ver detalles</a>
        </div>

        <div class="stat-card card-employees">
          <div class="card-kpi-number">{{ stats.employees }}</div>
          <h3>Empleados</h3>
          <a routerLink="/admin/empleados">Ver detalles</a>
        </div>

        <div class="stat-card card-attendances">
          <div class="card-kpi-number">{{ stats.attendances }}</div>
          <h3>Asistencias</h3>
          <a href="javascript:void(0)">Ver detalles</a>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 50px; color: #888;">
        <h2>Bienvenido al Panel de Control</h2>
        <p>Seleccione una opción del menú o de las tarjetas superiores.</p>
    </div>
  `,
  // IMPORTANTE: Conectar los estilos globales
  styleUrls: ['../../admin-dashboard.component.css'],
  styles: [`
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminHomeComponent implements OnInit {
  // Inicializamos en 0 para que no salga vacío mientras carga
  stats = {
    users: 0,
    areas: 0,
    employees: 0,
    attendances: 0
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        console.log('Datos estadísticos recibidos:', data);
        // Asignamos los datos reales del backend a nuestras variables
        this.stats.users = data.stats_users || 0;
        this.stats.areas = data.stats_areas || 0;
        this.stats.employees = data.stats_employees || 0;
        this.stats.attendances = data.stats_attendances || 0;
        
        // Forzamos actualización de vista
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando estadísticas', err)
    });
  }
}