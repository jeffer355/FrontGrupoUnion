import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2'; // IMPORTANTE

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Áreas</h2>
            <button class="btn-add" (click)="openModal('crear')"><i class="fas fa-plus"></i> Nueva Área</button>
        </div>
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr><th>ID</th><th>Nombre</th><th>Empleados</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    <tr *ngFor="let area of listaAreas">
                        <td>{{ area.idDepartamento }}</td>
                        <td><strong>{{ area.nombre }}</strong></td>
                        <td><span class="badge badge-role">{{ area.cantidadEmpleados || 0 }}</span></td>
                        <td>
                            <button class="action-btn view" (click)="verDetalles(area)"><i class="fas fa-eye"></i></button>
                            <button class="action-btn edit" (click)="openModal('editar', area)"><i class="fas fa-pen"></i></button>
                            <button class="action-btn delete" (click)="deleteArea(area)"><i class="fas fa-trash"></i></button>
                        </td>
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
            <div class="modal-content">
                <h3>{{ selectedArea?.nombre }}</h3>
                <p>Personal asignado:</p>
                <ul class="employee-list" style="padding:0; list-style:none; max-height:200px; overflow:auto;">
                    <li *ngFor="let emp of empleadosDelArea" style="padding:8px; border-bottom:1px solid #eee;">
                        <i class="fas fa-user"></i> {{ emp.persona?.nombres }} <small>({{ emp.cargo?.nombre }})</small>
                    </li>
                    <li *ngIf="empleadosDelArea.length === 0">No hay empleados.</li>
                </ul>
                <div class="modal-actions"><button (click)="closeDetailModal()" class="btn-save">Cerrar</button></div>
            </div>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminAreasComponent implements OnInit {
  listaAreas: any[] = []; 
  empleadosDelArea: any[] = []; 
  selectedArea: any = null;
  showModal = false; 
  showDetailModal = false; 
  isEditMode = false; 
  tempItem: any = {};

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { 
      this.service.getAreas().subscribe(d => { 
          this.listaAreas = d; 
          this.cdr.detectChanges(); 
      }); 
  }

  verDetalles(area: any) {
      this.selectedArea = area; 
      this.empleadosDelArea = []; 
      this.showDetailModal = true;
      this.service.getEmpleadosPorArea(area.idDepartamento).subscribe(d => this.empleadosDelArea = d);
  }

  openModal(mode: 'crear'|'editar', item?: any) {
      this.isEditMode = mode === 'editar'; 
      this.tempItem = item ? { ...item } : {}; 
      this.showModal = true;
  }

  guardarArea() {
      // Validar que no esté vacío
      if (!this.tempItem.nombre) {
          Swal.fire('Atención', 'Escribe un nombre para el área', 'warning');
          return;
      }

      const req = this.isEditMode 
        ? this.service.updateArea(this.tempItem.idDepartamento, this.tempItem) 
        : this.service.saveArea(this.tempItem);
      
      req.subscribe({
          next: () => { 
              this.ngOnInit(); 
              this.closeModal();
              // AQUI ESTA LA NOTIFICACION DE EXITO QUE QUERIAS
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

  deleteArea(area: any) {
      Swal.fire({
          title: '¿Estás seguro?',
          text: `Se eliminará el área: ${area.nombre}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
          if (result.isConfirmed) {
              this.service.deleteArea(area.idDepartamento).subscribe({
                  next: () => {
                      this.ngOnInit();
                      Swal.fire('Eliminado!', 'El área ha sido eliminada.', 'success');
                  },
                  error: (e) => Swal.fire('Error', e.error?.message || "No se puede eliminar", 'error')
              });
          }
      });
  }

  closeModal() { this.showModal = false; }
  closeDetailModal() { this.showDetailModal = false; }
}