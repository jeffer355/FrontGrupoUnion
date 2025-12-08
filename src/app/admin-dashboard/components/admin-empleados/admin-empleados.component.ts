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
            <button class="btn-add" (click)="openModal('crear')"><i class="fas fa-plus"></i> Nuevo Empleado</button>
        </div>
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr><th>Nombre</th><th>Documento</th><th>Departamento</th><th>Cargo</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    <tr *ngFor="let emp of listaEmpleados">
                        <td><div style="font-weight:bold;">{{ emp.persona?.nombres }}</div><small>{{ emp.persona?.email }}</small></td>
                        <td>{{ emp.persona?.nroDocumento }}</td>
                        <td>{{ emp.departamento?.nombre }}</td>
                        <td>{{ emp.cargo?.nombre }}</td>
                        <td>
                             <span class="badge badge-clickable" 
                                   [ngClass]="emp.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'"
                                   (click)="toggleEstado(emp)" 
                                   title="Clic para cambiar estado">
                                {{ emp.estado }}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 5px;">
                                <button class="action-btn view" (click)="verDetalles(emp)"><i class="fas fa-eye"></i></button>
                                <button class="action-btn edit" (click)="openModal('editar', emp)"><i class="fas fa-pen"></i></button>
                                <button class="action-btn delete" (click)="deleteEmpleado(emp.idEmpleado)"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content scrollable-modal">
                <h3>{{ isEditMode ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
                <div class="form-grid">
                    <div class="form-column">
                        <h4 class="section-title">Datos Personales</h4>
                        <div class="form-group"><label>Nombres</label><input type="text" [(ngModel)]="tempItem.persona.nombres" class="search-input full-width"></div>
                        <div class="form-row">
                            <div class="form-group half"><label>Tipo Doc</label>
                                <select [(ngModel)]="tempItem.persona.tipoDocumento.idTipoDoc" class="search-input full-width">
                                    <option *ngFor="let t of listaTiposDoc" [value]="t.idTipoDoc">{{ t.nombre }}</option>
                                </select>
                            </div>
                            <div class="form-group half"><label>Nro Doc</label><input type="text" [(ngModel)]="tempItem.persona.nroDocumento" class="search-input full-width"></div>
                        </div>
                        <div class="form-group"><label>Fecha Nac.</label><input type="date" [(ngModel)]="tempItem.persona.fechaNac" class="search-input full-width"></div>
                        <div class="form-group"><label>Teléfono</label><input type="text" [(ngModel)]="tempItem.persona.telefono" class="search-input full-width"></div>
                    </div>
                    <div class="form-column">
                        <h4 class="section-title">Datos Laborales</h4>
                        <div class="form-group"><label>Dirección</label><input type="text" [(ngModel)]="tempItem.persona.direccion" class="search-input full-width"></div>
                        <div class="form-group"><label>Email Corp.</label><input type="email" [(ngModel)]="tempItem.persona.email" class="search-input full-width"></div>
                        <div class="form-group"><label>Departamento</label>
                            <select [(ngModel)]="tempItem.departamento.idDepartamento" class="search-input full-width">
                                <option *ngFor="let a of listaAreas" [value]="a.idDepartamento">{{ a.nombre }}</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Fecha Ingreso</label><input type="date" [(ngModel)]="tempItem.fechaIngreso" class="search-input full-width"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button (click)="closeModal()" class="btn-cancel">Cancelar</button>
                    <button (click)="guardarEmpleado()" class="btn-save">Guardar</button>
                </div>
            </div>
        </div>

        <div class="modal-backdrop" *ngIf="showDetailModal">
            <div class="modal-content">
                <h3>Ficha del Empleado</h3>
                <div class="detail-row"><strong>Nombre:</strong> {{ selectedItem?.persona?.nombres }}</div>
                <div class="detail-row"><strong>Email:</strong> {{ selectedItem?.persona?.email }}</div>
                <div class="detail-row"><strong>Teléfono:</strong> {{ selectedItem?.persona?.telefono }}</div>
                <div class="detail-row"><strong>Departamento:</strong> {{ selectedItem?.departamento?.nombre }}</div>
                <div class="detail-row"><strong>Estado:</strong> {{ selectedItem?.estado }}</div>
                <div class="modal-actions"><button (click)="closeDetailModal()" class="btn-save">Cerrar</button></div>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .section-title { color: #e60000; font-size: 0.9rem; font-weight: bold; border-bottom: 2px solid #f9f9f9; padding-bottom: 5px; margin-bottom: 15px; }
    .form-row { display: flex; gap: 15px; } .half { flex: 1; }
    .scrollable-modal { width: 800px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `],
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminEmpleadosComponent implements OnInit {
  listaEmpleados: any[] = []; listaAreas: any[] = []; listaTiposDoc: any[] = [];
  showModal = false; showDetailModal = false; isEditMode = false;
  tempItem: any = this.initEmpty(); selectedItem: any = null;

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.service.getEmpleados().subscribe(d => { this.listaEmpleados = d; this.cdr.detectChanges(); });
    this.service.getAreas().subscribe(d => this.listaAreas = d);
    this.service.getTiposDocumento().subscribe(d => this.listaTiposDoc = d);
  }

  // LOGICA ACTIVAR/DESACTIVAR (STRING)
  toggleEstado(emp: any) {
      const estadoActual = emp.estado; 
      // Si es ACTIVO pasa a CESADO, sino a ACTIVO
      const nuevoEstado = (estadoActual === 'ACTIVO') ? 'CESADO' : 'ACTIVO';
      const accion = (nuevoEstado === 'ACTIVO') ? 'ACTIVAR' : 'CESAR';

      if(confirm(`¿Desea ${accion} al empleado ${emp.persona.nombres}?`)) {
          // Clonamos objeto completo y cambiamos solo el estado
          const empActualizado = { ...emp, estado: nuevoEstado };
          
          this.service.updateEmpleado(empActualizado).subscribe({
              next: () => this.ngOnInit(), // Recargar tabla
              error: (err) => alert("Error al cambiar estado")
          });
      }
  }

  initEmpty() { return { persona: { nombres: '', nroDocumento: '', fechaNac: '', telefono: '', email: '', direccion: '', tipoDocumento: { idTipoDoc: 1 } }, departamento: { idDepartamento: null }, cargo: { idCargo: 1 }, fechaIngreso: new Date().toISOString().split('T')[0], estado: 'ACTIVO' }; }

  openModal(mode: 'crear'|'editar', item?: any) {
      this.isEditMode = mode === 'editar';
      this.tempItem = this.isEditMode ? JSON.parse(JSON.stringify(item)) : this.initEmpty();
      if(this.isEditMode) {
          if(this.tempItem.persona.fechaNac) this.tempItem.persona.fechaNac = this.tempItem.persona.fechaNac.split('T')[0];
          if(this.tempItem.fechaIngreso) this.tempItem.fechaIngreso = this.tempItem.fechaIngreso.split('T')[0];
      }
      this.showModal = true;
  }

  guardarEmpleado() {
      if(!this.tempItem.persona.nombres || !this.tempItem.departamento.idDepartamento) { alert("Complete datos"); return; }
      const req = this.isEditMode ? this.service.updateEmpleado(this.tempItem) : this.service.createEmpleado(this.tempItem);
      req.subscribe({ next: () => { this.ngOnInit(); this.closeModal(); alert("Guardado"); }, error: (e) => alert("Error: " + e.message) });
  }

  deleteEmpleado(id: number) {
      if(confirm('¿Eliminar?')) this.service.deleteEmpleado(id).subscribe(() => this.ngOnInit());
  }

  verDetalles(item: any) { this.selectedItem = item; this.showDetailModal = true; }
  closeModal() { this.showModal = false; }
  closeDetailModal() { this.showDetailModal = false; }
}