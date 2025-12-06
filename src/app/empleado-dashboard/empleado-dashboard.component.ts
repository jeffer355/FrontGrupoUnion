import { Component, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router

// Define interfaces for data structures
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
  imports: [CommonModule], // Ensure RouterModule is not needed here if it's imported at root
  templateUrl: './empleado-dashboard.component.html',
  styleUrls: ['./empleado-dashboard.component.css']
})
export class EmpleadoDashboardComponent implements OnInit { // Implemented OnInit

  empleado: Empleado | null = null;
  usuario: Usuario | null = null;
  cumpleanosList: Cumpleanos[] = [];
  isSidebarActive: boolean = false; // For mobile sidebar toggle

  constructor(private router: Router) { } // Inject Router

  ngOnInit(): void {
    // Initialize with placeholder data (in a real app, this would come from a service)
    this.empleado = {
      nombres: 'Juan',
      nombreCompleto: 'Juan Pérez García',
      cargo: 'Desarrollador Frontend',
      email: 'juan.perez@grupounion.com',
      telefono: '+51 987 654 321'
    };

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
    console.log('Cerrar sesión clickeado. Redirigiendo a /auth/login');
    // In a real application, you would also clear authentication tokens/session here
    this.router.navigate(['/auth/login']);
  }

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
    console.log('Sidebar toggled:', this.isSidebarActive);
  }
}
