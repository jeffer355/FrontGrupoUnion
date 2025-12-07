import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Áreas</h2>
            <button class="btn-add" (click)="openModal('crear')"> <i class="fas fa-plus"></i> Nueva Área</button>
        </div>
        
        <div *ngIf="errorMessage" class="alert-error">
            {{ errorMessage }}
            <button (click)="errorMessage = null">x</button>
        </div>

        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>N° Empleados</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let area of listaAreas">
                        <td>{{ area.idDepartamento }}</td>
                        <td><strong>{{ area.nombre }}</strong></td>
                        <td>
                            <span class="badge badge-role">{{ area.cantidadEmpleados }}</span>
                        </td>
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
                <input type="text" [(ngModel)]="tempItem.nombre" class="search-input full-width">
                <div class="modal-actions">
                    <button (click)="closeModal()" class="btn-cancel">Cancelar</button>
                    <button (click)="guardarArea()" class="btn-save">Guardar</button>
                </div>
            </div>
        </div>

        <div class="modal-backdrop" *ngIf="showDetailModal">
            <div class="modal-content">
                <h3>{{ selectedArea?.nombre }}</h3>
                <p>Empleados asignados:</p>
                <ul class="employee-list">
                    <li *ngFor="let emp of empleadosDelArea">
                        {{ emp.persona?.nombres }} <small>({{ emp.cargo?.nombre }})</small>
                    </li>
                    <li *ngIf="empleadosDelArea.length === 0">Sin empleados.</li>
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
  showModal = false;
  showDetailModal = false;
  isEditMode = false;
  tempItem: any = {};
  selectedArea: any = null;
  errorMessage: string | null = null;

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.cargarAreas(); }

  cargarAreas() {
    this.service.getAreas().subscribe(data => {
        this.listaAreas = data; // Data ya trae 'cantidadEmpleados' gracias al DTO
        this.cdr.detectChanges();
    });
  }

  // Carga bajo demanda (solo cuando das click al ojito) -> OPTIMIZADO
  verDetalles(area: any) {
    this.selectedArea = area;
    this.service.getEmpleadosPorArea(area.idDepartamento).subscribe(emps => {
        this.empleadosDelArea = emps;
        this.showDetailModal = true;
        this.cdr.detectChanges();
    });
  }

  deleteArea(area: any) {
      if(confirm('¿Eliminar área?')) {
          this.service.deleteArea(area.idDepartamento).subscribe({
              next: () => { this.errorMessage = null; this.cargarAreas(); },
              error: (err) => {
                  // Mostrar mensaje del backend (ej: "No se puede eliminar porque tiene empleados")
                  this.errorMessage = err.error || 'Error al eliminar área';
                  this.cdr.detectChanges();
              }
          });
      }
  }

  // ... Resto de métodos (openModal, guardarArea) igual que antes ...
  openModal(mode: 'crear'|'editar', item?: any) {
      this.isEditMode = mode === 'editar';
      this.tempItem = item ? { ...item } : {};
      this.showModal = true;
  }
  guardarArea() {
      if(this.isEditMode) {
          this.service.updateArea(this.tempItem.idDepartamento, this.tempItem).subscribe(() => { this.cargarAreas(); this.closeModal(); });
      } else {
          this.service.saveArea(this.tempItem).subscribe(() => { this.cargarAreas(); this.closeModal(); });
      }
  }
  closeModal() { this.showModal = false; }
  closeDetailModal() { this.showDetailModal = false; }
}