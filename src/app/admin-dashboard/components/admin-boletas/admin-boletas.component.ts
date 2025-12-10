import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header"><h2><i class="fas fa-file-invoice-dollar" style="color: #003057;"></i> Gestión de Boletas</h2></div>

        <div class="upload-card">
            <h3 class="card-title"><i class="fas fa-cloud-upload-alt"></i> Nueva Publicación</h3>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Empleado</label>
                    <select [(ngModel)]="idEmpleado" class="form-control">
                        <option [ngValue]="null">-- Seleccione --</option>
                        <option *ngFor="let e of empleados" [value]="e.idEmpleado">{{ e.persona.nombres }} ({{ e.persona.nroDocumento }})</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group half">
                        <label>Mes</label>
                        <select [(ngModel)]="mes" class="form-control">
                            <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="m">{{m}}</option>
                        </select>
                    </div>
                    <div class="form-group half">
                        <label>Año</label>
                        <input type="number" [(ngModel)]="anio" class="form-control">
                    </div>
                </div>

                <div class="form-group">
                    <label>Archivo PDF</label>
                    <input type="file" (change)="onFile($event)" accept="application/pdf" class="form-control file-input">
                </div>
            </div>

            <div class="actions-right">
                <button class="btn-primary" (click)="subir()" [disabled]="uploading">
                    <i class="fas" [ngClass]="uploading ? 'fa-spinner fa-spin' : 'fa-save'"></i> 
                    {{ uploading ? 'Publicando...' : 'Publicar Boleta' }}
                </button>
            </div>
        </div>

        <div class="history-section">
            <h3><i class="fas fa-history"></i> Historial de Cargas</h3>
            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Fecha Carga</th>
                            <th>Empleado</th>
                            <th>Periodo</th>
                            <th>Subido Por</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let h of historial">
                            <td>{{ h.fechaSubida | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>
                                <strong>{{ h.empleado?.persona?.nombres }}</strong><br>
                                <small class="text-muted">DNI: {{ h.empleado?.persona?.nroDocumento }}</small>
                            </td>
                            <td>{{ h.mes }}/{{ h.anio }}</td>
                            <td><span class="badge bg-admin"><i class="fas fa-user-shield"></i> {{ h.subidoPor || 'Admin' }}</span></td>
                            <td>
                                <span class="badge" [ngClass]="h.estado === 'DISPONIBLE' ? 'bg-success' : 'bg-danger'">
                                    {{ h.estado }}
                                </span>
                            </td>
                            <td>
                                <button class="btn-icon-view" (click)="ver(h.urlArchivo)" title="Ver Archivo">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                        <tr *ngIf="historial.length === 0">
                            <td colspan="6" class="text-center">No se han subido boletas recientemente.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .upload-card { background: #f8f9fe; border: 1px solid #eef2f7; border-radius: 12px; padding: 25px; margin-bottom: 40px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
    .card-title { font-size: 1.1rem; color: #5e72e4; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
    
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; align-items: flex-end; }
    .form-row { display: flex; gap: 10px; }
    .half { flex: 1; }
    .file-input { padding: 8px; background: white; }
    
    .actions-right { grid-column: 1/-1; display: flex; justify-content: flex-end; margin-top: 15px; }
    
    .history-section h3 { font-size: 1.3rem; color: #32325d; margin-bottom: 15px; }
    .bg-admin { background: #e0e7ff; color: #4338ca; }
    .text-muted { color: #8898aa; font-size: 0.8rem; }
    .btn-icon-view { background: #11cdef; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .text-center { text-align: center; padding: 30px; color: #888; }

    @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminBoletasComponent implements OnInit {
  empleados: any[] = [];
  historial: any[] = [];
  
  idEmpleado: number | null = null;
  mes = new Date().getMonth() + 1;
  anio = new Date().getFullYear();
  file: File | null = null;
  uploading = false;

  constructor(
      private service: GestionCorporativaService, 
      private adminService: AdminCrudService,
      private cdr: ChangeDetectorRef // Inyección de ChangeDetectorRef
  ) {}

  ngOnInit() {
    // CORRECCIÓN REACTIVIDAD: Forzamos la actualización al recibir empleados
    this.adminService.getEmpleados().subscribe(d => {
        this.empleados = d;
        this.cdr.detectChanges(); // IMPORTANTE: Renderiza el select inmediatamente
    });
    
    this.cargarHistorial();
  }

  cargarHistorial() {
      this.service.getHistorialBoletasAdmin().subscribe({
          next: (d) => {
              this.historial = d;
              this.cdr.detectChanges(); // IMPORTANTE: Renderiza la tabla inmediatamente
          },
          error: (e) => console.error(e)
      });
  }

  onFile(e: any) { this.file = e.target.files[0]; }

  subir() {
    if (!this.idEmpleado || !this.file) { Swal.fire('Error', 'Complete el formulario', 'error'); return; }
    
    const fd = new FormData();
    fd.append('idEmpleado', this.idEmpleado.toString());
    fd.append('mes', this.mes.toString());
    fd.append('anio', this.anio.toString());
    fd.append('file', this.file);

    this.uploading = true;

    this.service.uploadBoleta(fd).subscribe({
        next: () => {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Boleta publicada correctamente',
                timer: 1500,
                showConfirmButton: false
            });
            
            this.uploading = false;
            this.file = null; 
            
            this.cargarHistorial();
        },
        error: () => {
            Swal.fire('Error', 'Fallo al subir', 'error');
            this.uploading = false;
            this.cdr.detectChanges(); // Asegura que el botón se desbloquee visualmente
        }
    });
  }

  ver(url: string) { if(url) window.open(url, '_blank'); }
}