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
            <div>
                <h2><i class="fas fa-file-contract" style="color: #003057;"></i> Gestión de Contratos</h2>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">Administra los contratos laborales y regímenes pensionales.</p>
            </div>
            
            <div style="display: flex; gap: 15px; align-items: center;">
                <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" 
                           placeholder="Buscar por nombre o DNI..." 
                           class="search-input-table" 
                           [(ngModel)]="searchText" 
                           (keyup)="filtrar()">
                </div>
                <button class="btn-add" (click)="toggleModal()">
                    <i class="fas fa-plus"></i> Nuevo Contrato
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Régimen & AFP</th>
                        <th>Sueldo Base</th>
                        <th>Vigencia</th>
                        <th>Estado</th>
                        <th class="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let c of contratosFiltrados">
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar-small" [style.background-color]="getColor(c.empleado?.persona?.nombres)">
                                    {{ c.empleado?.persona?.nombres.charAt(0) }}
                                </div>
                                <div>
                                    <strong>{{ c.empleado?.persona?.nombres }}</strong>
                                    <small class="text-muted d-block">{{ c.empleado?.persona?.nroDocumento }}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="font-weight: 600; color: #333;">{{ c.tipoRegimen }}</div>
                            <small class="text-muted" *ngIf="c.nombreAfp">{{ c.nombreAfp }}</small>
                        </td>
                        <td>
                            <span style="font-weight: 700; color: #2dce89;">S/ {{ c.sueldoBase | number:'1.2-2' }}</span>
                        </td>
                        <td>
                            <div style="font-size: 0.9rem; color: #555;">
                                <i class="fas fa-calendar-alt text-muted"></i> {{ c.fechaInicio | date:'dd/MM/yyyy' }}
                            </div>
                            <small class="text-muted">
                                Hasta: {{ c.fechaFin ? (c.fechaFin | date:'dd/MM/yyyy') : 'Indefinido' }}
                            </small>
                        </td>
                        <td>
                            <span class="badge" [ngClass]="c.vigente ? 'bg-success-pill' : 'bg-danger-pill'">
                                {{ c.vigente ? 'VIGENTE' : 'VENCIDO' }}
                            </span>
                        </td>
                        <td class="text-right">
                            <button class="btn-icon-view" (click)="descargarPdf(c.idContrato)" title="Descargar PDF">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                        </td>
                    </tr>
                    <tr *ngIf="contratosFiltrados.length === 0">
                        <td colspan="6" class="empty-state">
                            <i class="fas fa-folder-open"></i> 
                            {{ searchText ? 'No se encontraron resultados.' : 'No hay contratos registrados.' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Nuevo Contrato Laboral</h3>
                    <button class="close-btn" (click)="toggleModal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group position-relative">
                        <label>Empleado</label>
                        <div class="input-group">
                            <input type="text" class="form-control" 
                                   [(ngModel)]="searchEmp" 
                                   (keyup)="filtrarEmpleados()" 
                                   placeholder="Buscar por nombre o DNI..." 
                                   [disabled]="!!empleadoSeleccionado">
                            
                            <button *ngIf="empleadoSeleccionado" (click)="limpiarSeleccion()" class="btn-clear" title="Limpiar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="autocomplete-list" *ngIf="sugerencias.length > 0">
                            <div *ngFor="let e of sugerencias" class="suggestion-item" (click)="seleccionarEmpleado(e)">
                                <div class="item-avatar">{{ e.persona.nombres.charAt(0) }}</div>
                                <div>
                                    <strong>{{ e.persona.nombres }}</strong>
                                    <small style="display:block; color:#666;">{{ e.persona.nroDocumento }}</small>
                                </div>
                            </div>
                        </div>

                        <small *ngIf="empleadoSeleccionado" class="text-success">
                            <i class="fas fa-check-circle"></i> Seleccionado: {{ empleadoSeleccionado.persona.nombres }}
                        </small>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Régimen</label>
                            <select [(ngModel)]="nuevo.tipoRegimen" class="form-control">
                                <option value="ONP">ONP (Pública)</option>
                                <option value="AFP">AFP (Privada)</option>
                            </select>
                        </div>
                        <div class="form-group" *ngIf="nuevo.tipoRegimen === 'AFP'">
                            <label>Administradora (AFP)</label>
                            <select [(ngModel)]="nuevo.nombreAfp" class="form-control">
                                <option value="Integra">Integra</option>
                                <option value="Prima">Prima</option>
                                <option value="Habitat">Habitat</option>
                                <option value="Profuturo">Profuturo</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Sueldo Base Mensual (S/)</label>
                        <input type="number" [(ngModel)]="nuevo.sueldoBase" class="form-control" (blur)="validarSueldo()">
                        <small *ngIf="errorSueldo" style="color: #f5365c; font-size: 0.8rem; margin-top: 4px; display: block;">
                            <i class="fas fa-exclamation-triangle"></i> El sueldo mínimo vital es S/ 1130.
                        </small>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Fecha Inicio</label>
                            <input type="date" [(ngModel)]="nuevo.fechaInicio" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Fecha Fin (Opcional)</label>
                            <input type="date" [(ngModel)]="nuevo.fechaFin" class="form-control">
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" (click)="toggleModal()">Cancelar</button>
                    <button class="btn-save" (click)="guardar()">Generar Contrato</button>
                </div>
            </div>
        </div>
    </div>
  `,
  styles: [`
    /* HEADER */
    .crud-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #f4f4f4; padding-bottom: 15px; }
    .btn-add { background-color: #003057; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; white-space: nowrap; }
    .btn-add:hover { background-color: #002240; }

    /* ESTILOS DEL BUSCADOR */
    .search-wrapper { position: relative; }
    .search-input-table { padding: 8px 15px 8px 35px; border: 1px solid #ddd; border-radius: 20px; width: 250px; outline: none; transition: border-color 0.3s; font-size: 0.9rem; }
    .search-input-table:focus { border-color: #003057; box-shadow: 0 0 5px rgba(0,48,87,0.1); }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; font-size: 0.9rem; }

    /* TABLA MODERNA */
    .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
    .modern-table th { color: #8898aa; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; padding: 15px; text-align: left; }
    .modern-table td { background: white; padding: 15px; vertical-align: middle; border-top: 1px solid #f4f4f4; border-bottom: 1px solid #f4f4f4; }
    .modern-table tr td:first-child { border-left: 1px solid #f4f4f4; border-radius: 8px 0 0 8px; }
    .modern-table tr td:last-child { border-right: 1px solid #f4f4f4; border-radius: 0 8px 8px 0; }
    .modern-table tr:hover td { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(0,0,0,0.03); }

    /* CELDAS & AVATARES */
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-avatar-small { width: 38px; height: 38px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; }
    .text-muted { color: #8898aa; font-size: 0.8rem; }
    .d-block { display: block; }
    .text-right { text-align: right; }

    /* BADGES */
    .badge { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .bg-success-pill { background: #dfffe5; color: #2dce89; }
    .bg-danger-pill { background: #feebe9; color: #f5365c; }

    /* BOTONES ACCIÓN */
    .btn-icon-view { background: #fff; border: 1px solid #e0e0e0; color: #555; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-icon-view:hover { background: #003057; color: white; border-color: #003057; }

    .empty-state { text-align: center; padding: 30px; color: #aaa; background: white; font-style: italic; }

    /* MODAL */
    .modal-content { border-radius: 12px; padding: 0; overflow: hidden; width: 500px; }
    .modal-header { background: #f8f9fa; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
    .modal-header h3 { margin: 0; color: #003057; font-size: 1.2rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer; }
    .modal-body { padding: 25px; }
    .modal-actions { padding: 15px 25px; background: #f8f9fa; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; }

    /* INPUTS MODAL */
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #525f7f; margin-bottom: 5px; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    
    /* AUTOCOMPLETE */
    .position-relative { position: relative; }
    .input-group { display: flex; }
    .btn-clear { background: #fee2e2; border: 1px solid #fcdada; color: #f5365c; border-radius: 0 8px 8px 0; padding: 0 12px; cursor: pointer; border-left: none; }
    
    .autocomplete-list { position: absolute; width: 100%; background: white; top: 100%; left: 0; border: 1px solid #eee; z-index: 100; max-height: 150px; overflow-y: auto; border-radius: 0 0 8px 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .suggestion-item { padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f9f9f9; display: flex; align-items: center; gap: 10px; }
    .suggestion-item:hover { background: #f4f7fa; }
    .item-avatar { width: 30px; height: 30px; background: #e0e7ff; color: #4338ca; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
    .text-success { color: #2dce89; font-size: 0.85rem; margin-top: 5px; display: block; font-weight: 600; }

    /* BOTONES MODAL */
    .btn-save { background: #2dce89; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-cancel { background: white; border: 1px solid #ddd; color: #555; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
  `]
})
export class AdminContratosComponent implements OnInit {
  contratos: any[] = [];
  contratosFiltrados: any[] = []; // Lista para la tabla
  searchText: string = ''; // Variable del buscador

  empleados: any[] = [];
  sugerencias: any[] = [];
  
  showModal = false;
  searchEmp = '';
  empleadoSeleccionado: any = null;
  errorSueldo = false;
  
  nuevo: any = { tipoRegimen: 'AFP', nombreAfp: 'Integra', sueldoBase: 1130, fechaInicio: '', fechaFin: '' };

  constructor(private service: AdminCrudService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getContratos().subscribe(d => { 
        this.contratos = d;
        this.filtrar(); // Inicializar filtrado
        this.cdr.detectChanges(); 
    });
    this.service.getEmpleados().subscribe(d => this.empleados = d);
  }

  // --- LÓGICA DEL BUSCADOR DE CONTRATOS ---
  filtrar() {
      if (!this.searchText) {
          this.contratosFiltrados = this.contratos;
      } else {
          const txt = this.searchText.toLowerCase();
          this.contratosFiltrados = this.contratos.filter(c => 
              c.empleado?.persona?.nombres.toLowerCase().includes(txt) || 
              c.empleado?.persona?.nroDocumento.includes(txt)
          );
      }
  }

  // --- LÓGICA DEL AUTOCOMPLETE (MODAL) ---
  filtrarEmpleados() {
    if (!this.searchEmp) { this.sugerencias = []; return; }
    const txt = this.searchEmp.toLowerCase();
    this.sugerencias = this.empleados.filter(e => 
        e.persona.nombres.toLowerCase().includes(txt) || 
        e.persona.nroDocumento.includes(txt)
    );
  }

  seleccionarEmpleado(e: any) {
    this.empleadoSeleccionado = e;
    this.searchEmp = e.persona.nombres;
    this.sugerencias = [];
  }

  limpiarSeleccion() {
    this.empleadoSeleccionado = null;
    this.searchEmp = '';
    this.sugerencias = [];
  }

  validarSueldo() {
      this.errorSueldo = this.nuevo.sueldoBase < 1130;
  }

  toggleModal() { 
      this.showModal = !this.showModal; 
      if (!this.showModal) this.limpiarSeleccion(); 
  }

  guardar() {
    if (!this.empleadoSeleccionado || this.nuevo.sueldoBase < 1130 || !this.nuevo.fechaInicio) {
        Swal.fire('Error', 'Revise los campos obligatorios', 'error'); return;
    }
    const payload = {
        idEmpleado: this.empleadoSeleccionado.idEmpleado,
        ...this.nuevo,
        usuario: this.auth.getUserName() || 'Admin'
    };
    
    Swal.fire({ title: 'Generando...', didOpen: () => Swal.showLoading() });

    this.service.crearContrato(payload).subscribe({
        next: () => {
            Swal.fire('Éxito', 'Contrato generado', 'success');
            this.toggleModal();
            this.cargar();
        },
        error: (e) => Swal.fire('Error', e.error?.message || 'Error del servidor', 'error')
    });
  }

  descargarPdf(id: number) {
      window.open(`http://localhost:8081/api/admin/contratos/${id}/pdf`, '_blank');
  }

  getColor(name: string): string {
      const colors = ['#5e72e4', '#11cdef', '#2dce89', '#fb6340', '#f5365c'];
      let hash = 0;
      if (!name) return colors[0];
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
  }
}