import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // --- IMPORTANTE: Usamos 'template' con comillas invertidas (`), NO 'templateUrl' ---
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Usuarios</h2>
            <button class="btn-add" (click)="openModal('crear')"> 
                <i class="fas fa-plus"></i> Nuevo Usuario
            </button>
        </div>
        
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th> </tr>
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
                            <span class="badge" 
                                  [ngClass]="u.activo ? 'badge-active' : 'badge-inactive'"
                                  (click)="toggleEstado(u)" 
                                  style="cursor: pointer;"
                                  title="Clic para cambiar estado">
                                {{ u.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 5px;">
                                <button class="action-btn view" (click)="verDetalles(u)" title="Ver">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn edit" (click)="openModal('editar', u)" title="Editar">
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="action-btn delete" (click)="deleteUsuario(u.idUsuario)" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <h3>{{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
                
                <div class="form-group">
                    <label>Username (Email)</label>
                    <input type="email" [(ngModel)]="tempItem.username" class="search-input full-width">
                </div>
                
                <div class="form-group" *ngIf="!isEditMode">
                    <label>Contraseña</label>
                    <input type="password" [(ngModel)]="tempItem.hashPass" class="search-input full-width">
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
                <h3>Detalles del Usuario</h3>
                <div class="detail-row"><strong>ID:</strong> {{ selectedItem?.idUsuario }}</div>
                <div class="detail-row"><strong>Usuario:</strong> {{ selectedItem?.username }}</div>
                <div class="detail-row"><strong>Rol:</strong> {{ selectedItem?.rol?.nombre }}</div>
                <div class="detail-row"><strong>Estado:</strong> {{ selectedItem?.activo ? 'Activo' : 'Inactivo' }}</div>
                <div class="detail-row"><strong>Creado:</strong> {{ selectedItem?.creadoEn | date:'medium' }}</div>
                
                <div class="modal-actions">
                    <button (click)="closeDetailModal()" class="btn-save">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminUsuariosComponent implements OnInit {
  listaUsuarios: any[] = [];
  showModal = false; showDetailModal = false; isEditMode = false;
  tempItem: any = { rol: { idRol: 2 } }; selectedItem: any = null;

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { 
      this.service.getUsuarios().subscribe(data => {
          this.listaUsuarios = data;
          this.cdr.detectChanges();
      });
  }

  openModal(mode: 'crear'|'editar', item?: any) {
      this.isEditMode = mode === 'editar';
      this.tempItem = item ? JSON.parse(JSON.stringify(item)) : { rol: { idRol: 2 }, activo: true, persona: { idPersona: 1 } };
      if(this.isEditMode) this.tempItem.hashPass = '';
      this.showModal = true;
  }

  guardarUsuario() {
      if(!this.tempItem.username) { alert("Usuario requerido"); return; }
      const req = this.isEditMode ? this.service.updateUsuario(this.tempItem) : this.service.createUsuario(this.tempItem);
      req.subscribe({ next: () => { this.ngOnInit(); this.closeModal(); }, error: (e) => alert(e.error?.message || "Error") });
  }

  toggleEstado(u: any) {
      if(confirm('¿Cambiar estado?')) this.service.updateUsuario({...u, activo: !u.activo}).subscribe(() => this.ngOnInit());
  }

  deleteUsuario(id: number) {
      if(confirm('¿Eliminar?')) this.service.deleteUsuario(id).subscribe(() => this.ngOnInit());
  }

  verDetalles(item: any) { this.selectedItem = item; this.showDetailModal = true; }
  closeModal() { this.showModal = false; }
  closeDetailModal() { this.showDetailModal = false; }
}