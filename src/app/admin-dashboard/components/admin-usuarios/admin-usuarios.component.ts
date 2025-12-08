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
                <div class="form-group"><label>Username</label><input type="email" [(ngModel)]="tempItem.username" class="search-input full-width"></div>
                <div class="form-group" *ngIf="!isEditMode"><label>Contraseña</label><input type="password" [(ngModel)]="tempItem.hashPass" class="search-input full-width"></div>
                <div class="form-group"><label>Rol</label><select [(ngModel)]="tempItem.rol.idRol" class="search-input full-width"><option [value]="1">ADMIN</option><option [value]="2">EMPLEADO</option></select></div>
                <div class="modal-actions"><button (click)="closeModal()" class="btn-cancel">Cancelar</button><button (click)="guardarUsuario()" class="btn-save">Guardar</button></div>
            </div>
        </div>
        <div class="modal-backdrop" *ngIf="showDetailModal">
            <div class="modal-content">
                <h3>Detalles</h3>
                <div class="detail-row"><strong>Usuario:</strong> {{ selectedItem?.username }}</div>
                <div class="detail-row"><strong>Rol:</strong> {{ selectedItem?.rol?.nombre }}</div>
                <div class="modal-actions"><button (click)="closeDetailModal()" class="btn-save">Cerrar</button></div>
            </div>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminUsuariosComponent implements OnInit {
  listaUsuarios: any[] = [];
  listaFiltrada: any[] = []; // LISTA PARA EL BUSCADOR
  searchText: string = '';   // TEXTO DEL BUSCADOR

  showModal = false; showDetailModal = false; isEditMode = false;
  tempItem: any = { rol: { idRol: 2 } }; selectedItem: any = null;

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.service.getUsuarios().subscribe(data => {
        this.listaUsuarios = data;
        this.filtrar(); // Inicializar lista filtrada
        this.cdr.detectChanges();
    });
  }

  // --- LÓGICA DE FILTRADO ---
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

  // ... (RESTO DE TUS MÉTODOS IGUALES: toggle, guardar, delete, modal) ...
  toggleEstado(u:any){/*tu código*/}
  guardarUsuario(){/*tu código*/}
  deleteUsuario(id:number){/*tu código*/}
  openModal(m:any,i?:any){this.isEditMode=m==='editar';this.tempItem=i?JSON.parse(JSON.stringify(i)):{rol:{idRol:2},activo:true,persona:{idPersona:1}};if(this.isEditMode)this.tempItem.hashPass='';this.showModal=true;}
  verDetalles(i:any){this.selectedItem=i;this.showDetailModal=true;}
  closeModal(){this.showModal=false;}
  closeDetailModal(){this.showDetailModal=false;}
}