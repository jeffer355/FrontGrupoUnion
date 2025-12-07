import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="stats-cards-grid">
        <div class="stat-card card-users">
          <div class="card-kpi-number">15</div>
          <h3>Usuarios</h3>
          <a routerLink="/admin/usuarios">Ver detalles</a>
        </div>
        <div class="stat-card card-areas">
          <div class="card-kpi-number">6</div>
          <h3>Áreas</h3>
          <a routerLink="/admin/areas">Ver detalles</a>
        </div>
        <div class="stat-card card-employees">
          <div class="card-kpi-number">10</div>
          <h3>Empleados</h3>
          <a routerLink="/admin/empleados">Ver detalles</a>
        </div>
    </div>
    `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminHomeComponent {}