import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2><i class="fas fa-folder"></i> Gestión de Documentos</h2>
        </div>

        <div class="upload-card">
            <h3 class="card-title"><i class="fas fa-cloud-upload-alt"></i> Nueva Publicación</h3>
            
            <div class="form-grid">
                <div class="form-group big-col">
                    <label>Empleado Destino</label>
                    <select [(ngModel)]="uploadData.idEmpleado" class="form-control">
                        <option [ngValue]="null">-- Seleccione Empleado --</option>
                        <option *ngFor="let e of empleados" [value]="e.idEmpleado">
                            {{ e.persona.nombres }} ({{ e.persona.nroDocumento }})
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Nombre del Documento</label>
                    <input type="text" [(ngModel)]="uploadData.nombre" class="form-control" placeholder="Ej: Contrato 2025">
                </div>

                <div class="form-group small-col">
                    <label>Tipo</label>
                    <select [(ngModel)]="uploadData.tipo" class="form-control">
                        <option value="Contrato">Contrato</option>
                        <option value="Memo">Memorándum</option>
                        <option value="Adenda">Adenda</option>
                        <option value="Certificado">Certificado</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div class="form-group big-col">
                    <label>Archivo (PDF/IMG)</label>
                    <div class="file-input-wrapper">
                        <input type="file" (change)="onFileSelect($event)" class="form-control" id="fileUpload">
                    </div>
                </div>
            </div>

            <div class="actions-right">
                <button class="btn-primary" (click)="guardarDocumentoAdmin()" [disabled]="uploading">
                    <i class="fas" [ngClass]="uploading ? 'fa-spinner fa-spin' : 'fa-save'"></i> 
                    {{ uploading ? 'Enviando...' : 'Publicar Documento' }}
                </button>
            </div>
        </div>

        <div class="history-section">
            <h3><i class="fas fa-history"></i> Historial de Documentos</h3>
            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Fecha Carga</th>
                            <th>Empleado</th>
                            <th>Documento</th>
                            <th>Subido Por</th>
                            <th>Estado</th>
                            <th class="text-center-header">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let d of historial">
                            <td>{{ d.fechaSubida | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>
                                <strong>{{ d.empleado?.persona?.nombres }}</strong><br>
                                <small class="text-muted">DNI: {{ d.empleado?.persona?.nroDocumento }}</small>
                            </td>
                            <td>
                                <div style="font-weight: 500; color: #333;">{{ d.nombre }}</div>
                                <small class="badge badge-light">{{ d.tipo }}</small>
                            </td>
                            <td>
                                <span class="badge bg-admin">
                                    <i class="fas fa-user-shield"></i> {{ d.subidoPor || 'Admin' }}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge" [ngClass]="getStatusClass(d.estado)">
                                    {{ d.estado || 'PENDIENTE' }}
                                </span>
                                <div *ngIf="d.observacion && d.estado === 'RECHAZADO'" style="font-size:0.7rem; color:red; margin-top:2px;">
                                    <i class="fas fa-info-circle"></i> {{ d.observacion }}
                                </div>
                            </td>
                            <td class="actions-cell">
                                <div class="actions-wrapper">
                                    <button class="btn-icon-view" (click)="ver(d.urlArchivo)" title="Ver Archivo">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    
                                    <ng-container *ngIf="d.estado === 'PENDIENTE'">
                                        <button class="btn-icon-approve" (click)="aprobar(d)" title="Aprobar">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn-icon-reject" (click)="rechazar(d)" title="Rechazar">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </ng-container>

                                    <button *ngIf="d.estado === 'APROBADO'" class="btn-icon-update" (click)="actualizarDocumento(d)" title="Subir Versión Firmada/Devolver">
                                        <i class="fas fa-file-signature"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr *ngIf="historial.length === 0">
                            <td colspan="6" class="text-center">No se han subido documentos recientemente.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <input type="file" #fileUpdateInput style="display:none" (change)="procesarActualizacion($event)">
    </div>
  `,
  styles: [`
    .upload-card { background: #f8f9fe; border: 1px solid #eef2f7; border-radius: 12px; padding: 25px; margin-bottom: 40px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
    .card-title { font-size: 1.1rem; color: #5e72e4; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
    .form-grid { display: grid; grid-template-columns: 2fr 1.5fr 1fr 2fr; gap: 20px; align-items: flex-end; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #525f7f; margin-bottom: 0; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #dee2e6; border-radius: 0.35rem; background-color: #fff; height: 45px; transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out; }
    .form-control:focus { color: #8898aa; background-color: #fff; border-color: #5e72e4; outline: 0; box-shadow: 0 3px 9px rgba(50,50,9,0.05), 3px 4px 8px rgba(94,114,228,.1); }
    .actions-right { display: flex; justify-content: flex-end; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e9ecef; }
    .btn-primary { background-color: #003057; color: white; border: none; padding: 12px 25px; border-radius: 5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn-primary:hover { background-color: #002240; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08); }
    .history-section h3 { font-size: 1.3rem; color: #32325d; margin-bottom: 20px; border-left: 4px solid #003057; padding-left: 10px; }
    .text-center-header { text-align: center !important; }
    .actions-cell { text-align: center; }
    .actions-wrapper { display: flex; justify-content: center; align-items: center; gap: 8px; }
    .btn-icon-view, .btn-icon-approve, .btn-icon-reject, .btn-icon-update { border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .btn-icon-view { background: #11cdef; } .btn-icon-view:hover { background: #0da5c0; transform: scale(1.1); }
    .btn-icon-approve { background: #2dce89; } .btn-icon-approve:hover { background: #24a46d; transform: scale(1.1); }
    .btn-icon-reject { background: #f5365c; } .btn-icon-reject:hover { background: #c32b49; transform: scale(1.1); }
    .btn-icon-update { background: #5e72e4; } .btn-icon-update:hover { background: #324cdd; transform: scale(1.1); }
    .text-center { text-align: center; padding: 30px; color: #888; }
    .text-muted { color: #8898aa; font-size: 0.8rem; }
    .badge-light { background: #e9ecef; color: #495057; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .bg-admin { background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-approved { background: #d1e7dd; color: #0f5132; }
    .status-rejected { background: #f8d7da; color: #842029; }
    @media (max-width: 992px) { .form-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminDocumentosComponent implements OnInit {
  @ViewChild('fileUpdateInput') fileUpdateInput!: ElementRef;

  historial: any[] = [];
  empleados: any[] = [];
  
  uploadData: any = { idEmpleado: null, nombre: '', tipo: 'Contrato' };
  selectedFile: File | null = null;
  uploading = false;
  
  docToUpdateId: number | null = null;

  constructor(
      private service: GestionCorporativaService, 
      private adminService: AdminCrudService,
      private cdr: ChangeDetectorRef // Inyección
  ) {}

  ngOnInit() {
    this.cargar();
    // CORRECCIÓN REACTIVIDAD: Detectar cambios al recibir empleados
    this.adminService.getEmpleados().subscribe(d => {
        this.empleados = d;
        this.cdr.detectChanges(); // Renderizar selector
    });
    this.service.refreshNeeded$.subscribe(() => this.cargar());
  }

  cargar() {
    this.service.getHistorialDocumentosAdmin().subscribe({
        next: (d) => {
            this.historial = d;
            this.cdr.detectChanges(); // Renderizar tabla
        }
    });
  }

  ver(url: string) { if(url) window.open(url, '_blank'); }

  getStatusClass(status: string) {
      if (!status || status === 'PENDIENTE') return 'status-pending';
      if (status === 'APROBADO') return 'status-approved';
      return 'status-rejected';
  }

  onFileSelect(e: any) { this.selectedFile = e.target.files[0]; }

  guardarDocumentoAdmin() {
      if(!this.uploadData.idEmpleado || !this.selectedFile || !this.uploadData.nombre) {
          Swal.fire('Error', 'Por favor complete todos los campos y seleccione un archivo.', 'warning'); 
          return;
      }

      this.uploading = true;
      const fd = new FormData();
      fd.append('idEmpleado', this.uploadData.idEmpleado);
      fd.append('nombre', this.uploadData.nombre);
      fd.append('tipo', this.uploadData.tipo);
      fd.append('file', this.selectedFile);

      this.service.uploadDocumento(fd).subscribe({
          next: () => {
              Swal.fire({
                  icon: 'success',
                  title: 'Enviado',
                  text: 'Documento publicado correctamente',
                  timer: 1500,
                  showConfirmButton: false
              });
              this.uploadData = { idEmpleado: null, nombre: '', tipo: 'Contrato' };
              this.selectedFile = null;
              const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
              if(fileInput) fileInput.value = '';
              
              this.uploading = false;
              this.cdr.detectChanges(); // Actualizar UI (quitar loading)
          },
          error: (e) => {
              Swal.fire('Error', 'Fallo al subir el documento.', 'error');
              this.uploading = false;
              this.cdr.detectChanges();
          }
      });
  }

  actualizarDocumento(doc: any) {
      this.docToUpdateId = doc.idDocumento;
      this.fileUpdateInput.nativeElement.click();
  }

  procesarActualizacion(e: any) {
      const file = e.target.files[0];
      if (file && this.docToUpdateId) {
          Swal.fire({ title: 'Actualizando...', didOpen: () => Swal.showLoading() });
          this.service.replaceDocumento(this.docToUpdateId, file).subscribe({
              next: () => {
                  Swal.fire('Actualizado', 'Se ha subido la nueva versión del documento.', 'success');
                  this.docToUpdateId = null;
                  this.fileUpdateInput.nativeElement.value = '';
              },
              error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
          });
      }
  }

  aprobar(doc: any) {
      Swal.fire({
          title: '¿Aprobar documento?',
          text: `Documento: ${doc.nombre}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#2dce89',
          confirmButtonText: 'Sí, aprobar'
      }).then((result) => {
          if (result.isConfirmed) {
              this.service.updateEstadoDocumento(doc.idDocumento, 'APROBADO', 'Aprobado por administrador').subscribe(() => {
                  Swal.fire('Aprobado', 'El documento ha sido validado.', 'success');
              });
          }
      });
  }

  rechazar(doc: any) {
      Swal.fire({
          title: 'Rechazar documento',
          input: 'text',
          inputLabel: 'Motivo del rechazo',
          inputPlaceholder: 'Ej: Documento ilegible...',
          showCancelButton: true,
          confirmButtonColor: '#f5365c',
          confirmButtonText: 'Rechazar',
          preConfirm: (reason) => {
              if (!reason) Swal.showValidationMessage('Debe escribir un motivo');
              return reason;
          }
      }).then((result) => {
          if (result.isConfirmed) {
              this.service.updateEstadoDocumento(doc.idDocumento, 'RECHAZADO', result.value).subscribe(() => {
                  Swal.fire('Rechazado', 'Se ha notificado el rechazo.', 'info');
              });
          }
      });
  }
}