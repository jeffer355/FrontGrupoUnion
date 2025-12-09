import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. IMPORTAR ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-docs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header"><h2><i class="fas fa-folder-plus" style="color: #003057;"></i> Gestión de Documentos</h2></div>
        
        <div class="upload-card">
            <h3 class="card-title"><i class="fas fa-file-upload"></i> Subir Nuevo Documento</h3>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Empleado Destino</label>
                    <select [(ngModel)]="data.idEmpleado" class="form-control">
                        <option [ngValue]="null">-- Seleccione --</option>
                        <option *ngFor="let e of empleados" [value]="e.idEmpleado">{{ e.persona.nombres }} ({{ e.persona.nroDocumento }})</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nombre del Documento</label>
                    <input type="text" [(ngModel)]="data.nombre" class="form-control" placeholder="Ej: Contrato 2025">
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <select [(ngModel)]="data.tipo" class="form-control">
                        <option value="CONTRATO">Contrato</option>
                        <option value="MEDICO">Examen Médico</option>
                        <option value="CV">Curriculum Vitae</option>
                        <option value="OTROS">Otros</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label>Archivo (PDF/Imagen)</label>
                    <input type="file" (change)="onFile($event)" class="form-control file-input">
                </div>
            </div>
            
            <div class="actions-right">
                <button class="btn-primary" (click)="subir()" [disabled]="uploading">
                    <i class="fas" [ngClass]="uploading ? 'fa-spinner fa-spin' : 'fa-save'"></i> 
                    {{ uploading ? 'Subiendo...' : 'Guardar Documento' }}
                </button>
            </div>
        </div>

        <div class="history-section">
            <h3><i class="fas fa-history"></i> Historial de Documentos</h3>
            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Empleado</th>
                            <th>Documento</th>
                            <th>Tipo</th>
                            <th>Subido Por</th>
                            <th>Ver</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let h of historial">
                            <td>{{ h.fechaSubida | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>
                                <strong>{{ h.empleado?.persona?.nombres }}</strong>
                            </td>
                            <td>{{ h.nombre }}</td>
                            <td><span class="badge bg-info">{{ h.tipo }}</span></td>
                            <td><span class="badge bg-admin"><i class="fas fa-user-check"></i> {{ h.subidoPor || 'Admin' }}</span></td>
                            <td>
                                <button class="btn-icon-view" (click)="ver(h.urlArchivo)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                        <tr *ngIf="historial.length === 0">
                            <td colspan="6" class="text-center">No se han subido documentos.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .upload-card { background: #f8f9fe; border: 1px solid #eef2f7; border-radius: 12px; padding: 25px; margin-bottom: 40px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
    .card-title { font-size: 1.1rem; color: #fb6340; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .full-width { grid-column: 1 / -1; }
    .file-input { background: white; padding: 8px; }
    .actions-right { display: flex; justify-content: flex-end; margin-top: 15px; }
    .history-section h3 { font-size: 1.3rem; color: #32325d; margin-bottom: 15px; }
    .badge.bg-info { background: #11cdef; color: white; }
    .badge.bg-admin { background: #e0e7ff; color: #4338ca; }
    .btn-icon-view { background: #2dce89; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .text-center { text-align: center; padding: 30px; color: #8898aa; }
    @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminDocumentosComponent implements OnInit {
  empleados: any[] = [];
  historial: any[] = [];
  
  data: { idEmpleado: number | null; nombre: string; tipo: string } = { idEmpleado: null, nombre: '', tipo: 'CONTRATO' };
  file: File | null = null;
  uploading = false;

  constructor(
      private service: GestionCorporativaService, 
      private adminService: AdminCrudService,
      private cdr: ChangeDetectorRef // 2. INYECTARLO AQUÍ
  ) {}

  ngOnInit() { 
      this.adminService.getEmpleados().subscribe(d => this.empleados = d); 
      this.cargarHistorial();

      // Suscripción automática
      this.service.refreshNeeded$.subscribe(() => {
        this.cargarHistorial();
      });
  }

  cargarHistorial() {
      // 3. USAR .subscribe({ next: ... }) Y FORZAR DETECCIÓN
      this.service.getHistorialDocumentosAdmin().subscribe({
          next: (d) => {
              this.historial = d;
              this.cdr.detectChanges(); // <-- ESTO ES LA CLAVE
          }
      });
  }

  onFile(e: any) { this.file = e.target.files[0]; }

  subir() {
    if (this.data.idEmpleado === null || !this.file || !this.data.nombre) { Swal.fire('Error','Faltan datos','error'); return; }
    
    const fd = new FormData();
    fd.append('idEmpleado', this.data.idEmpleado.toString());
    fd.append('nombre', this.data.nombre);
    fd.append('tipo', this.data.tipo);
    fd.append('file', this.file);

    this.uploading = true;
    this.service.uploadDocumento(fd).subscribe({
        next: () => {
            Swal.fire('Listo', 'Documento guardado', 'success');
            this.uploading = false;
            this.file = null;
            this.data.nombre = '';
            
            // 4. LLAMAR MANUALMENTE POR SI ACASO
            this.cargarHistorial();
        },
        error: () => {
            Swal.fire('Error', 'No se pudo subir', 'error');
            this.uploading = false;
        }
    });
  }

  ver(url: string) { if(url) window.open(url, '_blank'); }
}