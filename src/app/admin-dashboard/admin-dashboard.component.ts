import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Necesario para router-outlet
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
  adminArea: string = '';

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    // Solo cargamos datos básicos del admin (nombre y área)
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        this.adminName = data.nombreCompleto || 'Administrador';
        this.adminArea = data.departamento || 'Administración';
      }
    });
  }

  toggleSidebar() { this.isSidebarActive = !this.isSidebarActive; }
  logout() { this.authService.logout(); }
}