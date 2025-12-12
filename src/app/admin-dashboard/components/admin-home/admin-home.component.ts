import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts'; // IMPORTANTE
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
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
    
    <div class="widgets-grid fade-in">
        
        <div class="widget-card">
            <div class="widget-header">
                <h4><i class="fas fa-chart-pie" style="color: #607d8b;"></i> Empleados por Área</h4>
            </div>
            <div class="widget-body chart-container">
                <canvas baseChart
                    [data]="doughnutChartData"
                    [options]="doughnutChartOptions"
                    [type]="doughnutChartType">
                </canvas>
                <div *ngIf="doughnutChartData.datasets[0].data.length === 0" class="no-data">
                    Cargando datos...
                </div>
            </div>
        </div>

        <div class="widget-card">
            <div class="widget-header">
                <h4><i class="fas fa-birthday-cake" style="color: #e91e63;"></i> Cumpleaños del Mes</h4>
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
    
    <div style="text-align: center; margin-top: 30px; color: #aaa; font-size: 0.9rem;">
        <p>Panel de Control - Grupo Unión &copy; 2025</p>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css'],
  styles: [`
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ESTILOS GRID WIDGETS */
    .widgets-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr; /* Gráfico más ancho, lista más angosta */
        gap: 20px;
        margin-top: 20px;
    }

    /* TARJETA GENERICA (IMITA EL ESTILO EXISTENTE) */
    .widget-card {
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        padding: 0; /* Header y body manejan padding */
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 350px; /* Altura fija para uniformidad */
    }

    .widget-header {
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
        background-color: #fff;
    }

    .widget-header h4 {
        margin: 0;
        font-size: 1rem;
        color: #333;
        font-weight: 600;
    }

    .widget-body {
        padding: 20px;
        flex-grow: 1;
        overflow: hidden;
    }

    /* ESTILOS CHART */
    .chart-container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    /* ESTILOS LISTA CUMPLEAÑOS */
    .scrollable-list {
        overflow-y: auto;
        padding: 0;
    }

    .birthday-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .birthday-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid #f9f9f9;
        transition: background 0.2s;
    }

    .birthday-item:hover {
        background-color: #fcfcfc;
    }

    .b-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #e0e7ff;
        color: #4338ca;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        margin-right: 12px;
        overflow: hidden;
    }

    .b-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .b-info {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .b-name { font-size: 0.9rem; font-weight: 600; color: #333; }
    .b-role { font-size: 0.75rem; color: #888; }

    .b-date {
        text-align: center;
        background: #fce4ec;
        color: #c2185b;
        padding: 5px 10px;
        border-radius: 8px;
        min-width: 50px;
    }

    .b-date .day { display: block; font-weight: bold; font-size: 1rem; line-height: 1; }
    .b-date .month { display: block; font-size: 0.6rem; text-transform: uppercase; }

    .no-data { text-align: center; color: #999; padding: 20px; font-style: italic; }

    /* RESPONSIVE */
    @media (max-width: 768px) {
        .widgets-grid { grid-template-columns: 1fr; height: auto; }
        .widget-card { height: auto; min-height: 300px; }
    }
  `]
})
export class AdminHomeComponent implements OnInit {
  stats = { users: 0, areas: 0, employees: 0, attendances: 0 };
  
  // Datos Cumpleaños
  birthdays: any[] = [];

  // Configuración Gráfico
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
    }
  };
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [ { data: [], backgroundColor: ['#3f51b5', '#00bcd4', '#e91e63', '#ffc107', '#4caf50', '#607d8b'] } ]
  };
  public doughnutChartType: ChartType = 'doughnut';

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
    this.cargarWidgets();
  }

  cargarEstadisticas() {
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        this.stats.users = data.stats_users || 0;
        this.stats.areas = data.stats_areas || 0;
        this.stats.employees = data.stats_employees || 0;
        this.stats.attendances = data.stats_attendances || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error stats', err)
    });
  }

  cargarWidgets() {
    // 1. Cargar Cumpleaños
    this.dashboardService.getBirthdayWidget().subscribe({
        next: (data) => {
            this.birthdays = data;
            this.cdr.detectChanges();
        }
    });

    // 2. Cargar Gráfico
    this.dashboardService.getChartWidget().subscribe({
        next: (data: any[]) => {
            // Transformar datos del backend (AreaResumenDTO) al formato de Chart.js
            const labels = data.map(item => item.nombre);
            const values = data.map(item => item.cantidadEmpleados);

            this.doughnutChartData = {
                labels: labels,
                datasets: [{ 
                    data: values,
                    backgroundColor: ['#3f51b5', '#00bcd4', '#e91e63', '#ffc107', '#4caf50', '#607d8b'],
                    hoverOffset: 4
                }]
            };
            this.cdr.detectChanges();
        }
    });
  }

  getMonthName(): string {
    const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    return months[new Date().getMonth()];
  }
}