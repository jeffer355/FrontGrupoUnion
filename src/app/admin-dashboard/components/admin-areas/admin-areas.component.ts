import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Áreas</h2>
            
            <div class="toolbar" style="display:flex; gap:10px; align-items:center;">
                <div class="search-wrapper" style="position:relative;">
                    <i class="fas fa-search search-icon" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#999;"></i>
                    <input type="text" 
                           placeholder="Buscar área por nombre..." 
                           class="search-input-table" 
                           style="padding-left:30px; padding-top:8px; padding-bottom:8px; border-radius:20px; border:1px solid #ddd;"
                           [(ngModel)]="searchText"
                           (keyup)="filtrar()">
                </div>
                <button class="btn-add" (click)="openModal('crear')"><i class="fas fa-plus"></i> Nueva Área</button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr><th>ID</th><th>Nombre</th><th>Empleados</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    <tr *ngFor="let area of listaFiltrada">
                        <td>{{ area.idDepartamento }}</td>
                        <td><strong>{{ area.nombre }}</strong></td>
                        <td><span class="badge badge-role">{{ area.cantidadEmpleados || 0 }}</span></td>
                        <td>
                            <button class="action-btn view" (click)="verDetalles(area)" title="Ver Personal Asignado"><i class="fas fa-eye"></i></button>
                            <button class="action-btn edit" (click)="openModal('editar', area)"><i class="fas fa-pen"></i></button>
                            </td>
                    </tr>
                    <tr *ngIf="listaFiltrada.length === 0">
                        <td colspan="4" style="text-align:center; padding:20px; color:#666;">No se encontraron áreas.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <h3>{{ isEditMode ? 'Editar Área' : 'Nueva Área' }}</h3>
                <div class="form-group">
                    <label>Nombre del Área</label>
                    <input type="text" [(ngModel)]="tempItem.nombre" class="search-input full-width">
                </div>
                <div class="modal-actions">
                    <button (click)="closeModal()" class="btn-cancel">Cancelar</button>
                    <button (click)="guardarArea()" class="btn-save">Guardar</button>
                </div>
            </div>
        </div>

        <div class="modal-backdrop" *ngIf="showDetailModal">
            <div class="modal-content" style="max-width: 500px;">
                <h3 style="border-bottom: 2px solid #003057; padding-bottom: 10px; color:#003057;">
                    <i class="fas fa-building"></i> {{ selectedArea?.nombre }}
                </h3>
                
                <p style="color:#666; margin-bottom:15px;">Personal asignado a esta área:</p>
                
                <div class="employee-list-container" style="max-height: 300px; overflow-y: auto; background: #f9f9f9; border-radius: 8px; padding: 10px;">
                    <ul class="employee-list" style="padding:0; list-style:none; margin:0;">
                        <li *ngFor="let emp of empleadosDelArea" style="padding:10px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:10px; background:white; margin-bottom:5px; border-radius:5px;">
                            <div style="width:35px; height:35px; background:#003057; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                                {{ emp.persona?.nombres.charAt(0) }}
                            </div>
                            <div>
                                <div style="font-weight:600; color:#333;">{{ emp.persona?.nombres }}</div>
                                <div style="font-size:0.8rem; color:#666;">
                                    <i class="fas fa-id-card"></i> {{ emp.persona?.nroDocumento }} | 
                                    <i class="fas fa-briefcase"></i> {{ emp.cargo?.nombre }}
                                </div>
                            </div>
                        </li>
                        <li *ngIf="empleadosDelArea.length === 0" style="text-align:center; padding:20px; color:#888;">
                            <i class="fas fa-users-slash" style="font-size:20px; margin-bottom:5px;"></i><br>
                            No hay empleados en esta área.
                        </li>
                    </ul>
                </div>
                
                <div class="modal-actions">
                    <button (click)="closeDetailModal()" class="btn-save">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminAreasComponent implements OnInit {
  listaAreas: any[] = []; 
  listaFiltrada: any[] = [];
  searchText: string = '';

  empleadosDelArea: any[] = []; 
  selectedArea: any = null;
  showModal = false; 
  showDetailModal = false; 
  isEditMode = false; 
  tempItem: any = {};

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { 
      this.cargarAreas();
  }

  cargarAreas() {
      this.service.getAreas().subscribe(d => { 
          this.listaAreas = d; 
          this.filtrar(); // Inicializar lista filtrada
          this.cdr.detectChanges(); 
      }); 
  }

  filtrar() {
      if (!this.searchText) {
          this.listaFiltrada = this.listaAreas;
      } else {
          const txt = this.searchText.toLowerCase();
          this.listaFiltrada = this.listaAreas.filter(a => 
              a.nombre.toLowerCase().includes(txt) || 
              (a.idDepartamento && a.idDepartamento.toString().includes(txt))
          );
      }
  }

  verDetalles(area: any) {
      this.selectedArea = area; 
      this.empleadosDelArea = []; 
      this.showDetailModal = true;
      
      // Llamada al servicio para obtener empleados
      this.service.getEmpleadosPorArea(area.idDepartamento).subscribe({
          next: (d) => {
              this.empleadosDelArea = d;
              this.cdr.detectChanges();
          },
          error: (e) => {
              Swal.fire('Error', 'No se pudo cargar el personal', 'error');
          }
      });
  }

  openModal(mode: 'crear'|'editar', item?: any) {
      this.isEditMode = mode === 'editar'; 
      this.tempItem = item ? { ...item } : {}; 
      this.showModal = true;
  }

  guardarArea() {
      if (!this.tempItem.nombre) {
          Swal.fire('Atención', 'Escribe un nombre para el área', 'warning');
          return;
      }

      const req = this.isEditMode 
        ? this.service.updateArea(this.tempItem.idDepartamento, this.tempItem) 
        : this.service.saveArea(this.tempItem);
      
      req.subscribe({
          next: () => { 
              this.cargarAreas(); 
              this.closeModal();
              Swal.fire({
                  icon: 'success',
                  title: 'Éxito',
                  text: 'Guardado',
                  showConfirmButton: true,
                  confirmButtonColor: '#10b981'
              });
          },
          error: (e) => {
              Swal.fire('Error', e.error?.message || 'Ocurrió un error', 'error');
          }
      });
  }

  // --- Método deleteArea ELIMINADO ---

  closeModal() { this.showModal = false; }
  closeDetailModal() { this.showDetailModal = false; }
}