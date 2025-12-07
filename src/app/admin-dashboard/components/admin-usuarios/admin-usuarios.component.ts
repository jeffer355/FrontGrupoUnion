import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { AdminCrudService } from '../../../services/admin-crud.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Usuarios</h2>
            <button class="btn-add"> <i class="fas fa-plus"></i> Nuevo Usuario</button>
        </div>
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let u of listaUsuarios">
                        <td>#{{ u.idUsuario }}</td>
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar-small">{{ u.username.charAt(0).toUpperCase() }}</div>
                                <span>{{ u.username }}</span>
                            </div>
                        </td>
                        <td><span class="badge badge-role">{{ u.rol?.nombre }}</span></td>
                        <td>
                            <span class="badge" [ngClass]="u.activo ? 'badge-active' : 'badge-inactive'">
                                {{ u.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn delete" (click)="deleteUsuario(u.idUsuario)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminUsuariosComponent implements OnInit {
  listaUsuarios: any[] = [];

  constructor(
      private adminCrudService: AdminCrudService,
      private cdr: ChangeDetectorRef // 2. Inyectar CDR
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.adminCrudService.getUsuarios().subscribe(data => {
        this.listaUsuarios = data;
        this.cdr.detectChanges(); // 3. ¡EL FIX! Forzar actualización visual
    });
  }

  deleteUsuario(id: number) {
    if(confirm('¿Eliminar usuario?')) {
        this.adminCrudService.deleteUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }
}