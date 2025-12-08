import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';

// Interfaz ajustada con fotoUrl opcional
interface EmpleadoData {
  nombres: string;
  nombreCompleto: string;
  cargo: string;
  email: string;
  telefono: string;
  departamento?: string;
  fotoUrl?: string; // Campo opcional para la foto
}

@Component({
  selector: 'app-empleado-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empleado-dashboard.component.html',
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
    if (username) {
      this.usuario = { username: username };
    }

    this.dashboardService.getEmpleadoData().subscribe({
      next: (data) => {
        console.log('Datos Empleado recibidos:', data);

        this.empleado = {
          nombres: data.nombres,
          nombreCompleto: data.nombres, 
          cargo: data.cargo,
          email: data.email,
          telefono: data.telefono,
          departamento: data.departamento,
          fotoUrl: data.fotoUrl // Asignamos la URL que viene del backend
        };
        
        // FORZAR ACTUALIZACIÓN DE VISTA
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando empleado:', err);
        // Datos de respaldo
        this.empleado = {
          nombres: 'Usuario Offline',
          nombreCompleto: 'Usuario Offline',
          cargo: 'Sin conexión',
          email: 'error@sistema',
          telefono: '000-000',
          departamento: 'Desconectado',
          fotoUrl: undefined 
        };
        this.cdr.detectChanges(); 
      }
    });

    this.cumpleanosList = [
      { nombre: 'María Lopez', fecha: '15 Ene' },
      { nombre: 'Carlos Ruiz', fecha: '22 Feb' },
      { nombre: 'Ana Gómez', fecha: '03 Mar' }
    ];
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }
}