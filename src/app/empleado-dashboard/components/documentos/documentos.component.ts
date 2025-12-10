import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleado-docs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
        <div class="header-section">
            <div>
                <h2><i class="fas fa-folder-open"></i> Documentos Laborales</h2>
                <p>Gestiona tus documentos contractuales y personales.</p>
            </div>
            <button class="btn-primary" (click)="toggleForm()">
                <i class="fas" [ngClass]="showForm ? 'fa-times' : 'fa-upload'"></i> 
                {{ showForm ? 'Cancelar' : 'Subir Documento' }}
            </button>
        </div>
        
        <div *ngIf="showForm" class="form-card fade-in">
            <h3 class="form-title">Subir Nuevo Documento</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label>Nombre del Documento</label>
                    <input type="text" [(ngModel)]="nuevoDoc.nombre" class="form-control" placeholder="Ej: Certificado de Estudios">
                </div>
                <div class="form-group">
                    <label>Tipo</label>
                    <select [(ngModel)]="nuevoDoc.tipo" class="form-control">
                        <option value="Certificado">Certificado</option>
                        <option value="Contrato Firmado">Contrato Firmado</option>
                        <option value="DNI Escaneado">DNI Escaneado</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Archivo (PDF o Imagen)</label>
                <input type="file" (change)="onFileSelect($event)" class="form-control">
            </div>
            <div class="form-actions">
                <button class="btn-success" (click)="subir()" [disabled]="uploading">
                    <i class="fas" [ngClass]="uploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                    {{ uploading ? 'Subiendo...' : 'Guardar Documento' }}
                </button>
            </div>
        </div>

        <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Obteniendo documentos...</p>
        </div>

        <div class="docs-grid" *ngIf="!loading">
            <div class="doc-card" *ngFor="let d of documentos">
                <div class="card-icon">
                    <i class="fas" [ngClass]="getIcono(d.urlArchivo)"></i>
                </div>
                <div class="card-body">
                    <h4>{{ d.nombre }}</h4>
                    <span class="badge">{{ d.tipo }}</span>
                    <p class="date">Subido: {{ d.fechaSubida | date:'dd/MM/yyyy' }}</p>
                    
                    <div style="margin-top: 10px;">
                        <span class="status-badge" [ngClass]="getStatusClass(d.estado)">
                            {{ d.estado || 'PENDIENTE' }}
                        </span>
                    </div>
                    <p *ngIf="d.observacion" class="obs-text"><small>{{ d.observacion }}</small></p>
                </div>
                
                <div class="card-footer">
                    <button class="btn-visualizar" (click)="descargarDirecto(d.urlArchivo)">
                        <i class="fas fa-download"></i> Descargar
                    </button>

                    <button *ngIf="d.estado === 'RECHAZADO'" class="btn-reenviar" (click)="prepararReenvio(d)">
                        <i class="fas fa-sync-alt"></i> Reenviar Archivo
                    </button>
                </div>
            </div>

            <div *ngIf="documentos.length === 0" class="empty-state">
                <i class="fas fa-folder-minus"></i>
                <h3>Sin documentos</h3>
                <p>No tienes documentos registrados.</p>
            </div>
        </div>

        <input type="file" #fileReenvio style="display: none;" (change)="procesarReenvio($event)">
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; }
    .header-section h2 { color: #003057; margin: 0; display: flex; align-items: center; gap: 10px; }
    
    .form-card { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee; }
    .form-title { margin-top: 0; color: #333; margin-bottom: 15px; font-size: 1.1rem; border-left: 4px solid #003057; padding-left: 10px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 5px; color: #555; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
    .form-actions { text-align: right; }

    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .doc-card { background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f0f0f0; display: flex; flex-direction: column; transition: transform 0.2s; }
    .doc-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    .card-icon { background: #fdf2f2; color: #dc3545; padding: 20px; text-align: center; font-size: 3rem; }
    .card-body { padding: 15px; text-align: center; flex-grow: 1; }
    .card-body h4 { margin: 0 0 10px; font-size: 1.1rem; color: #333; }
    .badge { background: #e3f2fd; color: #0277bd; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: bold; }
    .date { margin-top: 10px; font-size: 0.8rem; color: #888; }
    .card-footer { padding: 15px; background: #fafafa; border-top: 1px solid #eee; display: flex; flex-direction: column; gap: 8px; }
    
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-rejected { background: #f8d7da; color: #721c24; }
    .obs-text { color: #dc3545; font-style: italic; margin-top: 5px; }

    .btn-visualizar { width: 100%; background: #003057; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
    
    /* ESTILO BOTÓN REENVIAR */
    .btn-reenviar { width: 100%; background: #ffc107; color: #333; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-reenviar:hover { background: #e0a800; }

    .btn-primary { background: #003057; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .btn-success { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    
    .empty-state { grid-column: 1/-1; text-align: center; padding: 40px; border: 2px dashed #ddd; border-radius: 10px; color: #777; }
    .empty-state i { font-size: 3rem; margin-bottom: 10px; color: #ccc; }
    .loading-state { text-align: center; padding: 30px; font-size: 1.2rem; color: #666; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 10px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  `]
})
export class EmpleadoDocumentosComponent implements OnInit {
  @ViewChild('fileReenvio') fileReenvioInput!: ElementRef;
  
  documentos: any[] = [];
  loading = true;
  showForm = false;
  uploading = false;
  
  nuevoDoc = { nombre: '', tipo: 'Certificado' };
  file: File | null = null;
  docReenviarId: number | null = null;

  constructor(private service: GestionCorporativaService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { 
    this.cargar();
    this.service.refreshNeeded$.subscribe(() => this.cargar());
  }

  cargar() {
    this.service.getMisDocumentos().subscribe({
        next: (d) => {
            this.documentos = d;
            this.loading = false;
            this.cdr.detectChanges();
        },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
    }); 
  }

  toggleForm() {
      this.showForm = !this.showForm;
      this.nuevoDoc = { nombre: '', tipo: 'Certificado' };
      this.file = null;
  }

  onFileSelect(event: any) {
      this.file = event.target.files[0];
  }

  subir() {
      if (!this.nuevoDoc.nombre || !this.file) {
          Swal.fire('Atención', 'Nombre y archivo son obligatorios', 'warning');
          return;
      }
      this.uploading = true;
      const fd = new FormData();
      fd.append('nombre', this.nuevoDoc.nombre);
      fd.append('tipo', this.nuevoDoc.tipo);
      fd.append('file', this.file);

      this.service.uploadDocumentoEmpleado(fd).subscribe({
          next: () => {
              Swal.fire('Éxito', 'Documento subido. Pendiente de aprobación.', 'success');
              this.toggleForm();
              this.uploading = false;
          },
          error: (e) => {
              Swal.fire('Error', e.error?.message || 'Error al subir', 'error');
              this.uploading = false;
          }
      });
  }

  // --- LÓGICA DE REENVÍO ---
  prepararReenvio(doc: any) {
      this.docReenviarId = doc.idDocumento;
      // Simular click en el input file oculto
      this.fileReenvioInput.nativeElement.click();
  }

  procesarReenvio(event: any) {
      const file = event.target.files[0];
      if (file && this.docReenviarId) {
          Swal.fire({
              title: 'Reenviando...',
              text: 'Subiendo la nueva versión del documento',
              didOpen: () => Swal.showLoading()
          });

          this.service.replaceDocumento(this.docReenviarId, file).subscribe({
              next: () => {
                  Swal.fire('Corregido', 'El documento ha sido reenviado para revisión.', 'success');
                  this.docReenviarId = null;
                  this.fileReenvioInput.nativeElement.value = ''; // Limpiar input
              },
              error: (e) => Swal.fire('Error', 'No se pudo reenviar el archivo', 'error')
          });
      }
  }

  getIcono(url: string) {
      if (!url) return 'fa-file';
      if (url.endsWith('.pdf')) return 'fa-file-pdf';
      if (url.match(/\.(jpeg|jpg|png)$/)) return 'fa-file-image';
      return 'fa-file-alt';
  }

  getStatusClass(status: string) {
      if (!status || status === 'PENDIENTE') return 'status-pending';
      if (status === 'APROBADO') return 'status-approved';
      return 'status-rejected';
  }

  descargarDirecto(url: string) {
    if (!url) { Swal.fire('Error', 'URL no válida', 'error'); return; }
    let downloadUrl = url;
    if (url.includes('/upload/')) {
        downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
    }
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = 'Documento';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}