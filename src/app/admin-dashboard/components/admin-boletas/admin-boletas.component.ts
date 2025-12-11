import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

// Servicios
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import { AdminCrudService } from '../../../services/admin-crud.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <div>
                <h2><i class="fas fa-file-invoice-dollar" style="color: #003057;"></i> Gestión de Boletas</h2>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">Genera y consulta las boletas de pago mensuales.</p>
            </div>
        </div>

        <div class="form-card">
            <h3 class="card-title"><i class="fas fa-calculator"></i> Generar Nueva Boleta</h3>
            
            <div class="form-grid">
                <div class="form-group position-relative big-col">
                    <label>Empleado</label>
                    <div class="input-group">
                        <input type="text" class="form-control" 
                               [(ngModel)]="searchEmp" 
                               (keyup)="filtrarEmpleados()" 
                               placeholder="Buscar por nombre o DNI..." 
                               [disabled]="!!empSeleccionado">
                        
                        <button *ngIf="empSeleccionado" (click)="limpiar()" class="btn-clear" title="Limpiar">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="autocomplete-list" *ngIf="sugerencias.length > 0">
                        <div *ngFor="let e of sugerencias" class="suggestion-item" (click)="seleccionar(e)">
                            <div class="item-avatar">{{ e.persona.nombres.charAt(0) }}</div>
                            <div>
                                <strong>{{ e.persona.nombres }}</strong>
                                <small style="display:block; color:#666;">{{ e.persona.nroDocumento }}</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Mes</label>
                    <select [(ngModel)]="mes" class="form-control">
                        <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="m">Mes {{m}}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Año</label>
                    <input type="number" [(ngModel)]="anio" class="form-control">
                </div>

                <div class="form-group" style="display: flex; align-items: flex-end;">
                    <button class="btn-primary full-width" (click)="generarVistaPrevia()" [disabled]="!empSeleccionado || loading">
                        <i class="fas" [ngClass]="loading ? 'fa-spinner fa-spin' : 'fa-search'"></i> 
                        {{ loading ? 'Procesando...' : 'Vista Previa' }}
                    </button>
                </div>
            </div>

            <div *ngIf="pdfUrl" class="preview-box fade-in">
                <div class="preview-header">
                    <span class="preview-title"><i class="fas fa-eye"></i> Previsualización</span>
                    <div class="preview-actions">
                        <button class="btn-cancel-small" (click)="cerrarPreview()">Cerrar</button>
                        <button class="btn-save" (click)="guardarBoleta()" [disabled]="loading">
                            <i class="fas fa-check"></i> Confirmar y Publicar
                        </button>
                    </div>
                </div>
                <iframe [src]="pdfUrl" class="pdf-viewer"></iframe>
            </div>
        </div>

        <div class="history-section">
            <h3 class="section-title"><i class="fas fa-history"></i> Historial Reciente</h3>
            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Periodo</th>
                            <th>Fecha Gen.</th>
                            <th>Generado Por</th>
                            <th class="text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let h of historial">
                            <td>
                                <div class="user-cell">
                                    <div class="user-avatar-small" [style.background-color]="getColor(h.empleado?.persona?.nombres)">
                                        {{ h.empleado?.persona?.nombres.charAt(0) }}
                                    </div>
                                    <div>
                                        <strong>{{ h.empleado?.persona?.nombres }}</strong>
                                        <small class="text-muted d-block">{{ h.empleado?.persona?.nroDocumento }}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge badge-period">{{ h.mes | number:'2.0' }}/{{ h.anio }}</span>
                            </td>
                            <td style="color: #555;">{{ h.fechaSubida | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>
                                <span class="badge bg-admin"><i class="fas fa-user-shield"></i> {{ h.subidoPor }}</span>
                            </td>
                            <td class="text-right">
                                <button class="btn-icon-view" (click)="ver(h.urlArchivo)" title="Ver Boleta">
                                    <i class="fas fa-file-pdf"></i>
                                </button>
                            </td>
                        </tr>
                        <tr *ngIf="historial.length === 0">
                            <td colspan="5" class="empty-state">
                                <i class="fas fa-folder-open"></i> Sin boletas recientes
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .form-card { background: #ffffff; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
    .card-title { color: #003057; font-size: 1.1rem; margin-top: 0; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f4f4f4; display: flex; align-items: center; gap: 10px; }
    .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 20px; align-items: flex-end; }
    .big-col { grid-column: span 1; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #525f7f; margin-bottom: 5px; }
    .form-control { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; font-size: 0.95rem; height: 42px; }
    .form-control:focus { border-color: #003057; box-shadow: 0 0 0 3px rgba(0,48,87,0.1); outline: none; }
    .position-relative { position: relative; }
    .input-group { display: flex; }
    .btn-clear { background: #ffebeb; border: 1px solid #fadbd8; color: #e74c3c; padding: 0 12px; cursor: pointer; border-radius: 0 8px 8px 0; border-left: none; }
    .autocomplete-list { position: absolute; width: 100%; background: white; top: 100%; left: 0; border: 1px solid #eee; z-index: 100; max-height: 200px; overflow-y: auto; border-radius: 0 0 8px 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .suggestion-item { padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f9f9f9; display: flex; align-items: center; gap: 10px; }
    .suggestion-item:hover { background: #f4f7fa; }
    .item-avatar { width: 30px; height: 30px; background: #e0e7ff; color: #4338ca; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
    .btn-primary { background: #003057; color: white; border: none; height: 42px; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-primary:hover { background: #002240; transform: translateY(-1px); }
    .btn-save { background: #2dce89; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 5px; }
    .btn-cancel-small { background: #f3f4f6; color: #555; border: 1px solid #ddd; padding: 8px 15px; border-radius: 6px; cursor: pointer; }
    .preview-box { margin-top: 25px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .preview-header { background: #f8f9fa; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
    .preview-title { font-weight: 600; color: #333; }
    .preview-actions { display: flex; gap: 10px; }
    .pdf-viewer { width: 100%; height: 500px; border: none; background: #525659; }
    .section-title { font-size: 1.2rem; color: #333; margin-bottom: 15px; padding-left: 5px; border-left: 4px solid #2dce89; }
    .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
    .modern-table th { color: #8898aa; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; padding: 12px 15px; text-align: left; letter-spacing: 0.5px; }
    .modern-table td { background: white; padding: 15px; vertical-align: middle; border-top: 1px solid #f4f4f4; border-bottom: 1px solid #f4f4f4; }
    .modern-table tr td:first-child { border-left: 1px solid #f4f4f4; border-radius: 8px 0 0 8px; }
    .modern-table tr td:last-child { border-right: 1px solid #f4f4f4; border-radius: 0 8px 8px 0; }
    .modern-table tr:hover td { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(0,0,0,0.03); border-color: transparent; }
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-avatar-small { width: 38px; height: 38px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; }
    .text-muted { color: #8898aa; font-size: 0.8rem; }
    .d-block { display: block; }
    .text-right { text-align: right; }
    .badge { padding: 5px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
    .badge-period { background: #e3f2fd; color: #0277bd; }
    .bg-admin { background: #f3e5f5; color: #7b1fa2; }
    .btn-icon-view { background: #fff; border: 1px solid #e0e0e0; color: #555; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .btn-icon-view:hover { background: #003057; color: white; border-color: #003057; }
    .empty-state { text-align: center; padding: 30px; color: #aaa; font-style: italic; background: white; }
    @media (max-width: 992px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminBoletasComponent implements OnInit {
  empleados: any[] = [];
  historial: any[] = [];
  sugerencias: any[] = [];
  
  searchEmp = '';
  empSeleccionado: any = null;
  mes = new Date().getMonth() + 1;
  anio = new Date().getFullYear();
  
  pdfUrl: SafeResourceUrl | null = null;
  loading = false;

  constructor(
      private service: GestionCorporativaService, 
      private adminService: AdminCrudService,
      private auth: AuthService,
      private sanitizer: DomSanitizer,
      private cdr: ChangeDetectorRef // 1. INYECTADO CORRECTAMENTE
  ) {}

  ngOnInit() {
    this.adminService.getEmpleados().subscribe(d => this.empleados = d);
    this.cargarHistorial();
  }

  cargarHistorial() {
      this.service.getHistorialBoletasAdmin().subscribe({
          next: (d) => { 
              this.historial = d; 
              this.cdr.detectChanges(); // Actualizar vista al cargar historial
          }
      });
  }

  filtrarEmpleados() {
      if(!this.searchEmp) { this.sugerencias = []; return; }
      const txt = this.searchEmp.toLowerCase();
      this.sugerencias = this.empleados.filter(e => e.persona.nombres.toLowerCase().includes(txt));
  }

  seleccionar(e: any) { this.empSeleccionado = e; this.searchEmp = e.persona.nombres; this.sugerencias = []; }
  
  limpiar() { 
      this.empSeleccionado = null; 
      this.searchEmp = ''; 
      this.pdfUrl = null; 
      this.sugerencias = []; 
  }

  cerrarPreview() {
      this.pdfUrl = null;
  }

  // --- AQUÍ ESTÁ LA MAGIA DEL DETECTOR DE CAMBIOS ---
  generarVistaPrevia() {
      if(!this.empSeleccionado) {
          Swal.fire('Atención', 'Seleccione un empleado primero', 'warning');
          return;
      }

      this.loading = true;
      this.pdfUrl = null;
      
      const payload = { 
          idEmpleado: this.empSeleccionado.idEmpleado, 
          mes: this.mes, 
          anio: this.anio 
      };
      
      this.adminService.previsualizarBoleta(payload).subscribe({
          next: (blob: Blob) => {
              const objectUrl = URL.createObjectURL(blob);
              this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
              
              this.loading = false;
              // 2. FORZAR ACTUALIZACIÓN DE LA VISTA
              // Esto hace que el PDF y el botón "Confirmar" aparezcan inmediatamente
              this.cdr.detectChanges(); 
          },
          error: (err) => {
              console.error(err);
              Swal.fire('Error', 'No se pudo generar. Verifique si el empleado tiene contrato activo.', 'error');
              this.loading = false;
              this.cdr.detectChanges(); // Forzar actualización para quitar el spinner
          }
      });
  }

  guardarBoleta() {
      Swal.fire({
          title: '¿Publicar Boleta?',
          text: 'Se guardará y estará visible para el empleado.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, Publicar',
          confirmButtonColor: '#2dce89'
      }).then(r => {
          if(r.isConfirmed) {
              this.loading = true;
              
              const payload = { 
                  idEmpleado: this.empSeleccionado.idEmpleado, 
                  mes: this.mes, 
                  anio: this.anio,
                  usuario: this.auth.getUserName() || 'Admin'
              };

              this.adminService.guardarBoletaGenerada(payload).subscribe({
                  next: () => {
                      Swal.fire('Éxito', 'Boleta generada y publicada.', 'success');
                      this.pdfUrl = null;
                      this.limpiar();
                      this.cargarHistorial();
                      this.loading = false;
                      this.cdr.detectChanges(); // Forzar actualización final
                  },
                  error: (e) => {
                      Swal.fire('Error', e.error?.message || 'Error al guardar', 'error');
                      this.loading = false;
                      this.cdr.detectChanges();
                  }
              });
          }
      });
  }

  ver(url: string) { if(url) window.open(url, '_blank'); }

  getColor(name: string): string {
      const colors = ['#5e72e4', '#11cdef', '#2dce89', '#fb6340', '#f5365c'];
      let hash = 0;
      if (!name) return colors[0];
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
  }
}