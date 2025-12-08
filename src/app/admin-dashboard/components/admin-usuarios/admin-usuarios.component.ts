import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Usuarios</h2>
            
            <div class="toolbar">
                <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" 
                           placeholder="Buscar usuario..." 
                           class="search-input-table"
                           [(ngModel)]="searchText"
                           (keyup)="filtrar()">
                </div>
                <button class="btn-add" (click)="openModal('crear')"> 
                    <i class="fas fa-plus"></i> Nuevo
                </button>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr><th>ID</th><th>Username</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    <tr *ngFor="let u of listaFiltrada">
                        <td>#{{ u.idUsuario }}</td>
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar-small">{{ u.username.charAt(0).toUpperCase() }}</div>
                                <span>{{ u.username }}</span>
                            </div>
                        </td>
                        <td><span class="badge badge-role">{{ u.rol?.nombre }}</span></td>
                        <td>
                            <span class="badge badge-clickable" 
                                  [ngClass]="u.activo ? 'badge-active' : 'badge-inactive'"
                                  (click)="toggleEstado(u)" title="Clic para cambiar">
                                {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 5px;">
                                <button class="action-btn view" (click)="verDetalles(u)"><i class="fas fa-eye"></i></button>
                                <button class="action-btn edit" (click)="openModal('editar', u)"><i class="fas fa-pen"></i></button>
                                <button class="action-btn delete" (click)="deleteUsuario(u.idUsuario)"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="listaFiltrada.length === 0">
                        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                            No se encontraron resultados para "{{searchText}}"
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <h3>{{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
                
                <div class="alert-info" style="background:#e0f2fe; color:#0369a1; padding:10px; border-radius:5px; margin-bottom:15px; font-size:0.9em;">
                    <i class="fas fa-info-circle"></i> El usuario (email) debe existir previamente en la tabla de Empleados/Personas.
                </div>

                <div class="form-group">
                    <label>Username (Email)</label>
                    <input type="email" [(ngModel)]="tempItem.username" class="search-input full-width" placeholder="ejemplo@grupounion.com">
                </div>
                
                <div class="form-group" *ngIf="!isEditMode">
                    <label>Contraseña Temporal</label>
                    <input type="password" [(ngModel)]="tempItem.hashPass" class="search-input full-width" placeholder="******">
                </div>
                
                <div class="form-group">
                    <label>Rol</label>
                    <select [(ngModel)]="tempItem.rol.idRol" class="search-input full-width">
                        <option [value]="1">ADMIN</option>
                        <option [value]="2">EMPLEADO</option>
                    </select>
                </div>
                
                <div class="modal-actions">
                    <button (click)="closeModal()" class="btn-cancel">Cancelar</button>
                    <button (click)="guardarUsuario()" class="btn-save">Guardar</button>
                </div>
            </div>
        </div>

        <div class="modal-backdrop" *ngIf="showDetailModal">
            <div class="modal-content">
                <h3>Detalles</h3>
                <div class="detail-row"><strong>Usuario:</strong> {{ selectedItem?.username }}</div>
                <div class="detail-row"><strong>Rol:</strong> {{ selectedItem?.rol?.nombre }}</div>
                <div class="detail-row"><strong>Estado:</strong> {{ selectedItem?.activo ? 'Activo' : 'Inactivo' }}</div>
                <div class="detail-row"><strong>Persona Asignada:</strong> {{ selectedItem?.persona?.nombres }}</div>
                <div class="modal-actions"><button (click)="closeDetailModal()" class="btn-save">Cerrar</button></div>
            </div>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminUsuariosComponent implements OnInit {
  listaUsuarios: any[] = [];
  listaFiltrada: any[] = [];
  searchText: string = '';

  showModal = false; 
  showDetailModal = false; 
  isEditMode = false;
  tempItem: any = this.initEmpty(); 
  selectedItem: any = null;

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.service.getUsuarios().subscribe(data => {
        this.listaUsuarios = data;
        this.filtrar(); 
        this.cdr.detectChanges();
    });
  }

  filtrar() {
      if (!this.searchText) {
          this.listaFiltrada = this.listaUsuarios;
      } else {
          const texto = this.searchText.toLowerCase();
          this.listaFiltrada = this.listaUsuarios.filter(u => 
              u.username.toLowerCase().includes(texto) || 
              u.rol?.nombre.toLowerCase().includes(texto)
          );
      }
  }

  toggleEstado(u: any) {
      const nuevoEstado = !u.activo;
      const original = u.activo;
      u.activo = nuevoEstado; // Optimista

      this.service.updateUsuario(u).subscribe({
          next: () => {
              const msg = nuevoEstado ? 'Usuario activado' : 'Usuario desactivado';
              Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'success',
                  title: msg,
                  showConfirmButton: false,
                  timer: 2000
              });
          },
          error: () => {
              u.activo = original; // Revertir
              Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
          }
      });
  }

  guardarUsuario() {
      if (!this.tempItem.username || (!this.isEditMode && !this.tempItem.hashPass)) {
          Swal.fire('Atención', 'Complete todos los campos', 'warning');
          return;
      }

      // Asegurar que el rol viene como objeto
      if (typeof this.tempItem.rol.idRol === 'string') {
          this.tempItem.rol.idRol = parseInt(this.tempItem.rol.idRol);
      }

      const request = this.isEditMode 
          ? this.service.updateUsuario(this.tempItem) 
          : this.service.createUsuario(this.tempItem);

      request.subscribe({
          next: () => {
              this.cargarUsuarios();
              this.closeModal();
              // NOTIFICACIÓN VISUAL TIPO IMAGEN 1
              Swal.fire({
                  icon: 'success',
                  title: 'Éxito',
                  text: 'Guardado',
                  showConfirmButton: true,
                  confirmButtonColor: '#10b981'
              });
          },
          error: (e) => {
              // AQUÍ SE MUESTRA POR QUÉ FALLÓ (Ej: Correo no existe en Persona)
              const msg = e.error?.message || 'Error desconocido al guardar';
              Swal.fire('Error', msg, 'error');
          }
      });
  }

  deleteUsuario(id: number) {
      Swal.fire({
          title: '¿Eliminar Usuario?',
          text: "Esta acción no se puede deshacer.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar'
      }).then((result) => {
          if (result.isConfirmed) {
              this.service.deleteUsuario(id).subscribe({
                  next: () => {
                      this.cargarUsuarios();
                      Swal.fire('Eliminado', 'El usuario ha sido eliminado', 'success');
                  },
                  error: (e) => Swal.fire('Error', e.error?.message, 'error')
              });
          }
      });
  }

  initEmpty() {
      return { 
          username: '', 
          hashPass: '', 
          activo: true, 
          rol: { idRol: 2 } // Por defecto Empleado
      };
  }

  openModal(m: 'crear' | 'editar', i?: any) {
      this.isEditMode = m === 'editar';
      if (this.isEditMode && i) {
          // Clonar objeto para no editar en tabla directamente
          this.tempItem = JSON.parse(JSON.stringify(i));
          this.tempItem.hashPass = ''; // Limpiar pass en edición
      } else {
          this.tempItem = this.initEmpty();
      }
      this.showModal = true;
  }

  verDetalles(i: any) { this.selectedItem = i; this.showDetailModal = true; }
  closeModal() { this.showModal = false; }
  closeDetailModal() { this.showDetailModal = false; }
}