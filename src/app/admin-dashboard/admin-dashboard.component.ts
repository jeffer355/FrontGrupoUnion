import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  adminArea: string = '';
  
  // VARIABLE PARA LA FOTO
  adminPhoto: string | null = null; 

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAdminData();

    // --- SUSCRIPCIÓN EN TIEMPO REAL ---
    // Esto escucha si la foto cambia desde el modulo de usuarios
    this.dashboardService.currentAdminPhoto$.subscribe(photoUrl => {
        if(photoUrl) {
            this.adminPhoto = photoUrl;
            this.cdr.detectChanges(); // Forzamos actualización de vista
        }
    });
  }

  loadAdminData() {
    this.dashboardService.getAdminData().subscribe({
      next: (data) => {
        console.log('Datos Admin Dashboard:', data); 
        this.adminName = data.nombreCompleto || 'Administrador';
        this.adminArea = data.departamento || 'Administración';
        
        // Si el servicio no tenía foto aun, la seteamos aqui
        if (data.fotoUrl && !this.adminPhoto) {
             this.adminPhoto = data.fotoUrl;
        }
        
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

  toggleSidebar() { 
    this.isSidebarActive = !this.isSidebarActive; 
  }

  logout() { 
    this.authService.logout(); 
  }
}