import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';
import { DashboardService } from '../../../services/dashboard.service'; // Importamos DashboardService
import { AuthService } from '../../../auth/services/auth.service'; // Importamos AuthService
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
                    <input type="text" placeholder="Buscar usuario..." class="search-input-table" [(ngModel)]="searchText" (keyup)="filtrar()">
                </div>
                <button class="btn-add" (click)="openModal('crear')"> <i class="fas fa-plus"></i> Nuevo </button>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr><th>ID</th><th>Usuario (Foto)</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    <tr *ngFor="let u of listaFiltrada">
                        <td>#{{ u.idUsuario }}</td>
                        <td>
                            <div class="user-cell">
                                <img *ngIf="u.persona?.fotoUrl" [src]="u.persona.fotoUrl" class="user-avatar-small">
                                <div *ngIf="!u.persona?.fotoUrl" class="user-avatar-small">
                                    {{ u.username.charAt(0).toUpperCase() }}
                                </div>
                                <span>{{ u.username }}</span>
                            </div>
                        </td>
                        <td><span class="badge badge-role">{{ u.rol?.nombre }}</span></td>
                        <td>
                            <span class="badge badge-clickable" [ngClass]="u.activo ? 'badge-active' : 'badge-inactive'" (click)="toggleEstado(u)">
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
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <h3>{{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
                
                <div class="alert-info" style="background:#e0f2fe; color:#0369a1; padding:10px; margin-bottom:15px; border-radius:5px;">
                    <i class="fas fa-info-circle"></i> El email debe existir previamente en Empleados.
                </div>

                <div class="form-group">
                    <label>Username (Email)</label>
                    <input type="email" [(ngModel)]="tempItem.username" class="search-input full-width">
                </div>
                
                <div class="form-group" *ngIf="!isEditMode">
                    <label>Contraseña Temporal</label>
                    <input type="password" [(ngModel)]="tempItem.hashPass" class="search-input full-width">
                </div>
                
                <div class="form-group">
                    <label>Rol</label>
                    <select [(ngModel)]="tempItem.rol.idRol" class="search-input full-width">
                        <option [value]="1">ADMIN</option>
                        <option [value]="2">EMPLEADO</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Foto de Perfil (Opcional)</label>
                    <input type="file" (change)="onFileSelected($event)" accept="image/*" class="search-input full-width">
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
                <div style="text-align:center; margin-bottom:15px;" *ngIf="selectedItem?.persona?.fotoUrl">
                     <img [src]="selectedItem.persona.fotoUrl" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">
                </div>
                <div class="detail-row"><strong>Usuario:</strong> {{ selectedItem?.username }}</div>
                <div class="detail-row"><strong>Rol:</strong> {{ selectedItem?.rol?.nombre }}</div>
                <div class="detail-row"><strong>Estado:</strong> {{ selectedItem?.activo ? 'Activo' : 'Inactivo' }}</div>
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
  
  selectedFile: File | null = null;
  currentUser: string | null = null; // Variable para guardar quién soy yo

  constructor(
      private service: AdminCrudService, 
      private dashboardService: DashboardService, // Inyectamos dashboardService
      private authService: AuthService, // Inyectamos authService para saber mi usuario
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
      this.cargarUsuarios();
      this.currentUser = this.authService.getUserName(); // Obtengo mi usuario actual del localStorage
  }

  cargarUsuarios() {
    this.service.getUsuarios().subscribe(data => {
        this.listaUsuarios = data;
        this.filtrar(); 
        this.cdr.detectChanges();
    });
  }

  filtrar() {
      if (!this.searchText) { this.listaFiltrada = this.listaUsuarios; } 
      else {
          const texto = this.searchText.toLowerCase();
          this.listaFiltrada = this.listaUsuarios.filter(u => u.username.toLowerCase().includes(texto));
      }
  }

  toggleEstado(u: any) {
      u.activo = !u.activo;
      this.service.updateUsuario(u).subscribe({
          next: () => Swal.fire({ icon: 'success', title: 'Estado actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 }),
          error: () => { u.activo = !u.activo; Swal.fire('Error', 'No se pudo cambiar', 'error'); }
      });
  }

  onFileSelected(event: any) {
      this.selectedFile = event.target.files[0];
  }

  guardarUsuario() {
      if (!this.tempItem.username || (!this.isEditMode && !this.tempItem.hashPass)) {
          Swal.fire('Atención', 'Complete campos obligatorios', 'warning'); return;
      }
      if (typeof this.tempItem.rol.idRol === 'string') this.tempItem.rol.idRol = parseInt(this.tempItem.rol.idRol);

      const request = this.isEditMode ? this.service.updateUsuario(this.tempItem) : this.service.createUsuario(this.tempItem);

      request.subscribe({
          next: (userSaved: any) => {
              // Lógica de subida de foto
              if (this.selectedFile && userSaved && userSaved.persona && userSaved.persona.idPersona) {
                  this.service.uploadFotoPersona(userSaved.persona.idPersona, this.selectedFile).subscribe({
                      next: (res: any) => {
                          const newUrl = res.message; // El backend devuelve la URL en 'message'
                          
                          // *** CLAVE: Si estoy editando MI propio usuario, actualizo el sidebar ***
                          if (this.currentUser === userSaved.username) {
                              this.dashboardService.updatePhoto(newUrl);
                          }
                          
                          this.finalizarGuardado('Usuario y foto guardados');
                      },
                      error: (err) => this.finalizarGuardado('Usuario guardado, pero error en foto')
                  });
              } else {
                  this.finalizarGuardado('Usuario guardado');
              }
          },
          error: (e) => Swal.fire('Error', e.error?.message || 'Error al guardar', 'error')
      });
  }

  finalizarGuardado(msg: string) {
      this.cargarUsuarios();
      this.closeModal();
      this.selectedFile = null;
      Swal.fire({ icon: 'success', title: 'Éxito', text: msg, confirmButtonColor: '#10b981' });
  }

  deleteUsuario(id: number) {
      Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }).then((r) => {
          if (r.isConfirmed) this.service.deleteUsuario(id).subscribe(() => { this.cargarUsuarios(); Swal.fire('Eliminado', '', 'success'); });
      });
  }

  initEmpty() { return { username: '', hashPass: '', activo: true, rol: { idRol: 2 } }; }
  
  openModal(m: 'crear' | 'editar', i?: any) {
      this.isEditMode = m === 'editar';
      this.tempItem = i ? JSON.parse(JSON.stringify(i)) : this.initEmpty();
      if (this.isEditMode) this.tempItem.hashPass = '';
      this.selectedFile = null; 
      this.showModal = true;
  }
  
  verDetalles(i: any) { this.selectedItem = i; this.showDetailModal = true; }
  closeModal() { this.showModal = false; }
  closeDetailModal() { this.showDetailModal = false; }
}