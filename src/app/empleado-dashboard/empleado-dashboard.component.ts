import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Asegura importar RouterModule si usas routerLink
import { AuthService } from '../auth/services/auth.service'; // Importar AuthService

interface Empleado {
  nombres: string;
  nombreCompleto: string;
  cargo: string;
  email: string;
  telefono: string;
}

interface Usuario {
  username: string;
}

interface Cumpleanos {
  nombre: string;
  fecha: string;
}

@Component({
  selector: 'app-empleado-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadido RouterModule por si usas routerLink en el HTML
  templateUrl: './empleado-dashboard.component.html',
  styleUrls: ['./empleado-dashboard.component.css']
})
export class EmpleadoDashboardComponent implements OnInit {

  empleado: Empleado | null = null;
  usuario: Usuario | null = null;
  cumpleanosList: Cumpleanos[] = [];
  isSidebarActive: boolean = false;

  // Inyectar AuthService
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Datos placeholder (idealmente esto vendría de otro servicio usando el ID del usuario guardado)
    this.empleado = {
      nombres: 'Juan',
      nombreCompleto: 'Juan Pérez García',
      cargo: 'Desarrollador Frontend',
      email: 'juan.perez@grupounion.com',
      telefono: '+51 987 654 321'
    };

    // Podemos recuperar el username real del authService si quisieras
    this.usuario = {
      username: 'juan.perez@grupounion.com'
    };

    this.cumpleanosList = [
      { nombre: 'María Lopez', fecha: '15 Ene' },
      { nombre: 'Carlos Ruiz', fecha: '22 Feb' },
      { nombre: 'Ana Gómez', fecha: '03 Mar' }
    ];
  }

  logout(): void {
    // Usar el servicio para logout limpio
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }
}