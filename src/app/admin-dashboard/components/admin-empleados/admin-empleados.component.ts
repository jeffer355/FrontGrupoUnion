import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';

@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Empleados</h2>
            <button class="btn-add" (click)="openModal('crear')"> <i class="fas fa-plus"></i> Nuevo Empleado</button>
        </div>
        
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Departamento</th>
                        <th>Cargo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let emp of listaEmpleados">
                        <td>
                            <div style="font-weight: bold;">{{ emp.persona?.nombres }}</div>
                            <small style="color: #666;">{{ emp.persona?.email }}</small>
                        </td>
                        <td>
                            {{ emp.persona?.tipoDocumento?.nombre }}: {{ emp.persona?.nroDocumento }}
                        </td>
                        <td>{{ emp.departamento?.nombre }}</td>
                        <td>{{ emp.cargo?.nombre }}</td>
                        <td>
                             <span class="badge" [ngClass]="emp.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'"
                                   (click)="toggleEstado(emp)" style="cursor: pointer;" title="Clic para cambiar estado">
                                {{ emp.estado }}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn edit" (click)="openModal('editar', emp)"><i class="fas fa-pen"></i></button>
                            <button class="action-btn delete" (click)="deleteEmpleado(emp.idEmpleado)"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content scrollable-modal">
                <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 20px; color: #333;">
                    {{ isEditMode ? 'Editar Empleado' : 'Nuevo Empleado' }}
                </h3>
                
                <div class="form-grid">
                    <div class="form-column">
                        <h4 class="section-title">Datos Personales</h4>
                        
                        <div class="form-group">
                            <label>Nombres Completos</label>
                            <input type="text" [(ngModel)]="tempItem.persona.nombres" class="search-input full-width" placeholder="Ej: Juan Perez">
                        </div>

                        <div class="form-row">
                            <div class="form-group half">
                                <label>Tipo Doc.</label>
                                <select [(ngModel)]="tempItem.persona.tipoDocumento.idTipoDoc" class="search-input full-width">
                                    <option *ngFor="let td of listaTiposDoc" [value]="td.idTipoDoc">{{ td.nombre }}</option>
                                </select>
                            </div>
                            <div class="form-group half">
                                <label>Nro Documento</label>
                                <input type="text" [(ngModel)]="tempItem.persona.nroDocumento" class="search-input full-width">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Fecha Nacimiento</label>
                            <input type="date" [(ngModel)]="tempItem.persona.fechaNac" class="search-input full-width">
                        </div>

                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="text" [(ngModel)]="tempItem.persona.telefono" class="search-input full-width" placeholder="Ej: 999 888 777">
                        </div>
                    </div>

                    <div class="form-column">
                        <h4 class="section-title">Contacto y Laboral</h4>

                        <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" [(ngModel)]="tempItem.persona.direccion" class="search-input full-width" placeholder="Av. Principal 123">
                        </div>

                        <div class="form-group">
                            <label>Email Corporativo</label>
                            <input type="email" [(ngModel)]="tempItem.persona.email" class="search-input full-width" placeholder="juan@grupounion.com">
                        </div>

                        <div class="form-group">
                            <label>Departamento</label>
                            <select [(ngModel)]="tempItem.departamento.idDepartamento" class="search-input full-width">
                                <option [ngValue]="null" disabled>Seleccione...</option>
                                <option *ngFor="let area of listaAreas" [value]="area.idDepartamento">{{ area.nombre }}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Fecha Ingreso</label>
                            <input type="date" [(ngModel)]="tempItem.fechaIngreso" class="search-input full-width">
                        </div>
                    </div>
                </div>

                <div class="modal-actions" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                    <button (click)="closeModal()" class="btn-cancel">Cancelar</button>
                    <button (click)="guardarEmpleado()" class="btn-save">Guardar Datos</button>
                </div>
            </div>
        </div>
    </div>
  `,
  // --- AQUÍ ESTABA EL ERROR: FALTABA ESTA LÍNEA ---
  styleUrls: ['../../admin-dashboard.component.css'], 
  // ------------------------------------------------
  
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .section-title { color: #e60000; margin-bottom: 15px; font-size: 0.9rem; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #f9f9f9; padding-bottom: 5px; }
    .form-row { display: flex; gap: 15px; }
    .half { flex: 1; }
    .scrollable-modal { width: 800px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
    .form-group label { font-size: 0.85rem; color: #555; margin-bottom: 5px; display: block; font-weight: 600; }
    
    @media (max-width: 768px) {
        .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminEmpleadosComponent implements OnInit {
  listaEmpleados: any[] = [];
  listaAreas: any[] = [];
  listaTiposDoc: any[] = [];
  
  showModal = false;
  isEditMode = false;
  tempItem: any = this.initEmptyEmpleado();

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.service.getEmpleados().subscribe(data => { this.listaEmpleados = data; this.cdr.detectChanges(); });
    this.service.getAreas().subscribe(data => this.listaAreas = data);
    this.service.getTiposDocumento().subscribe(data => this.listaTiposDoc = data);
  }

  initEmptyEmpleado() {
      return {
          persona: { 
              nombres: '', 
              nroDocumento: '', 
              fechaNac: '', 
              telefono: '',
              email: '', 
              direccion: '',
              tipoDocumento: { idTipoDoc: 1 } // DNI por defecto
          },
          departamento: { idDepartamento: null },
          cargo: { idCargo: 1 }, 
          fechaIngreso: new Date().toISOString().split('T')[0],
          estado: 'ACTIVO'
      };
  }

  openModal(mode: 'crear'|'editar', item?: any) {
      this.isEditMode = mode === 'editar';
      if(this.isEditMode) {
          this.tempItem = JSON.parse(JSON.stringify(item));
          // Formatear fechas para input date (YYYY-MM-DD)
          if(this.tempItem.persona.fechaNac) this.tempItem.persona.fechaNac = this.tempItem.persona.fechaNac.split('T')[0];
          if(this.tempItem.fechaIngreso) this.tempItem.fechaIngreso = this.tempItem.fechaIngreso.split('T')[0];
      } else {
          this.tempItem = this.initEmptyEmpleado();
      }
      this.showModal = true;
  }

  guardarEmpleado() {
      if (!this.tempItem.persona.nombres || !this.tempItem.persona.nroDocumento) {
          alert("Los campos Nombres y Documento son obligatorios."); return;
      }
      if (!this.tempItem.departamento.idDepartamento) {
          alert("Seleccione un Departamento."); return;
      }

      const request = this.isEditMode 
          ? this.service.updateEmpleado(this.tempItem) 
          : this.service.createEmpleado(this.tempItem);

      request.subscribe({
          next: () => {
              this.cargarDatos(); 
              this.closeModal(); 
              alert(this.isEditMode ? "Empleado actualizado." : "Empleado creado exitosamente.");
          },
          error: (err) => alert("Error: " + (err.error?.message || err.message))
      });
  }

  toggleEstado(emp: any) {
      const nuevo = emp.estado === 'ACTIVO' ? 'CESADO' : 'ACTIVO';
      this.service.updateEmpleado({ ...emp, estado: nuevo }).subscribe(() => this.cargarDatos());
  }

  deleteEmpleado(id: number) {
      if(confirm('¿Seguro que desea eliminar este empleado?')) {
          this.service.deleteEmpleado(id).subscribe(() => this.cargarDatos());
      }
  }

  closeModal() { this.showModal = false; }
}