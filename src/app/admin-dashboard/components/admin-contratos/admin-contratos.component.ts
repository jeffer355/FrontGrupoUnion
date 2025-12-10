import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2><i class="fas fa-file-contract"></i> Gestión de Contratos</h2>
            <button class="btn-add" (click)="toggleModal()">
                <i class="fas fa-plus"></i> Nuevo Contrato
            </button>
        </div>

        <div class="payroll-card">
            <div class="card-content">
                <h3><i class="fas fa-calculator"></i> Generación de Boletas</h3>
                <p>Calcula la nómina del mes basándose en contratos vigentes.</p>
            </div>
            <div class="card-actions">
                <select [(ngModel)]="mesGen" class="form-control-sm">
                    <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="m">Mes {{m}}</option>
                </select>
                <button class="btn-primary" (click)="generarPlanilla()">Procesar</button>
            </div>
        </div>

        <h3>Historial</h3>
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Régimen</th>
                        <th>Sueldo</th>
                        <th>Vigencia</th>
                        <th>Estado</th>
                        <th>PDF</th> </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let c of contratos">
                        <td>
                            <strong>{{ c.empleado?.persona?.nombres }}</strong><br>
                            <small>{{ c.empleado?.persona?.nroDocumento }}</small>
                        </td>
                        <td>
                            {{ c.tipoRegimen }} 
                            <small *ngIf="c.nombreAfp">({{ c.nombreAfp }})</small>
                        </td>
                        <td style="font-weight: bold; color: #003057;">S/ {{ c.sueldoBase | number:'1.2-2' }}</td>
                        <td>
                            {{ c.fechaInicio | date:'dd/MM/yyyy' }} 
                            <i class="fas fa-arrow-right"></i> 
                            {{ c.fechaFin ? (c.fechaFin | date:'dd/MM/yyyy') : 'Indef.' }}
                        </td>
                        <td>
                            <span class="badge" [ngClass]="c.vigente ? 'bg-success' : 'bg-danger'">
                                {{ c.vigente ? 'ACTIVO' : 'VENCIDO' }}
                            </span>
                        </td>
                        <td>
                            <button class="btn-icon pdf-btn" (click)="descargarPdf(c.idContrato)" title="Descargar Contrato">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <h3>Nuevo Contrato</h3>
                
                <div class="form-group position-relative">
                    <label>Empleado</label>
                    <input type="text" class="form-control" 
                           [(ngModel)]="searchEmp" 
                           (keyup)="filtrarEmpleados()" 
                           placeholder="Buscar por nombre o DNI..." 
                           [disabled]="!!empleadoSeleccionado">
                    
                    <button *ngIf="empleadoSeleccionado" (click)="limpiarSeleccion()" class="btn-clear">X</button>
                    
                    <div class="autocomplete-list" *ngIf="sugerencias.length > 0">
                        <div *ngFor="let e of sugerencias" class="suggestion-item" (click)="seleccionarEmpleado(e)">
                            {{ e.persona.nombres }} - {{ e.persona.nroDocumento }}
                        </div>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Régimen</label>
                        <select [(ngModel)]="nuevo.tipoRegimen" class="form-control">
                            <option value="ONP">ONP</option>
                            <option value="AFP">AFP</option>
                        </select>
                    </div>
                    <div class="form-group" *ngIf="nuevo.tipoRegimen === 'AFP'">
                        <label>AFP</label>
                        <select [(ngModel)]="nuevo.nombreAfp" class="form-control">
                            <option value="Integra">Integra</option>
                            <option value="Prima">Prima</option>
                            <option value="Habitat">Habitat</option>
                            <option value="Profuturo">Profuturo</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Sueldo Base (Mín. S/ 1130)</label>
                    <input type="number" [(ngModel)]="nuevo.sueldoBase" class="form-control" (blur)="validarSueldo()">
                    <small *ngIf="errorSueldo" style="color: red;">El sueldo debe ser mayor a 1130</small>
                </div>

                <div class="form-grid">
                    <div class="form-group"><label>Inicio</label><input type="date" [(ngModel)]="nuevo.fechaInicio" class="form-control"></div>
                    <div class="form-group"><label>Fin (Opcional)</label><input type="date" [(ngModel)]="nuevo.fechaFin" class="form-control"></div>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" (click)="toggleModal()">Cancelar</button>
                    <button class="btn-save" (click)="guardar()">Guardar Contrato</button>
                </div>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .payroll-card { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #90caf9; }
    .autocomplete-list { position: absolute; background: white; width: 100%; border: 1px solid #ddd; z-index: 10; top: 100%; }
    .suggestion-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; }
    .suggestion-item:hover { background: #f5f5f5; }
    .pdf-btn { background: #d32f2f; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .pdf-btn:hover { background: #b71c1c; transform: scale(1.1); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .btn-clear { position: absolute; right: 10px; top: 35px; background: none; border: none; font-weight: bold; cursor: pointer; }
  `]
})
export class AdminContratosComponent implements OnInit {
  contratos: any[] = [];
  empleados: any[] = [];
  sugerencias: any[] = [];
  showModal = false;
  searchEmp = '';
  empleadoSeleccionado: any = null;
  mesGen = new Date().getMonth() + 1;
  errorSueldo = false;
  
  nuevo: any = { tipoRegimen: 'AFP', nombreAfp: 'Integra', sueldoBase: 1130, fechaInicio: '', fechaFin: '' };

  constructor(private service: AdminCrudService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getContratos().subscribe(d => { this.contratos = d; this.cdr.detectChanges(); });
    this.service.getEmpleados().subscribe(d => this.empleados = d);
  }

  filtrarEmpleados() {
    if (!this.searchEmp) { this.sugerencias = []; return; }
    const txt = this.searchEmp.toLowerCase();
    this.sugerencias = this.empleados.filter(e => e.persona.nombres.toLowerCase().includes(txt));
  }

  seleccionarEmpleado(e: any) {
    this.empleadoSeleccionado = e;
    this.searchEmp = e.persona.nombres;
    this.sugerencias = [];
  }

  limpiarSeleccion() {
    this.empleadoSeleccionado = null;
    this.searchEmp = '';
  }

  validarSueldo() {
      this.errorSueldo = this.nuevo.sueldoBase < 1130;
  }

  toggleModal() { this.showModal = !this.showModal; }

  guardar() {
    if (!this.empleadoSeleccionado || this.nuevo.sueldoBase < 1130 || !this.nuevo.fechaInicio) {
        Swal.fire('Error', 'Revise los campos obligatorios', 'error'); return;
    }
    const payload = {
        idEmpleado: this.empleadoSeleccionado.idEmpleado,
        ...this.nuevo,
        usuario: this.auth.getUserName()
    };
    
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

    this.service.crearContrato(payload).subscribe({
        next: () => {
            Swal.fire('Éxito', 'Contrato creado', 'success');
            this.toggleModal();
            this.cargar();
        },
        error: (e) => Swal.fire('Error', e.error?.message || 'Error del servidor', 'error')
    });
  }

  generarPlanilla() {
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
    this.service.generarPlanilla(this.mesGen, new Date().getFullYear(), 'Admin').subscribe(
        res => Swal.fire('Éxito', res.message, 'success'),
        err => Swal.fire('Error', 'Fallo al procesar', 'error')
    );
  }

  descargarPdf(id: number) {
      window.open(`http://localhost:8081/api/admin/contratos/${id}/pdf`, '_blank');
  }
}