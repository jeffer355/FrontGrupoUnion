import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleado-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
        
        <div class="header-section">
            <div>
                <h2><i class="fas fa-paper-plane" style="color: #003057;"></i> Mis Solicitudes</h2>
                <p>Gestiona tus requerimientos con RRHH.</p>
            </div>
            <button class="btn-primary" (click)="toggleForm()">
                <i class="fas" [ngClass]="showForm ? 'fa-times' : 'fa-plus'"></i> 
                {{ showForm ? 'Cancelar' : 'Nueva Solicitud' }}
            </button>
        </div>

        <div *ngIf="showForm" class="form-card fade-in">
            <h3 class="form-title">Nueva Solicitud</h3>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Tipo de Solicitud</label>
                    <select [(ngModel)]="nueva.idTipo" class="form-control">
                        <option [value]="1">Vacaciones</option>
                        <option [value]="2">Descanso Médico</option>
                        <option [value]="3">Sustento de Inasistencia</option>
                        <option [value]="4">Otros</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Asunto</label>
                    <input type="text" [(ngModel)]="nueva.asunto" class="form-control" placeholder="Ej: Vacaciones Noviembre">
                </div>
            </div>

            <div class="form-group">
                <label>Detalle / Descripción</label>
                <textarea [(ngModel)]="nueva.detalle" class="form-control" rows="4" placeholder="Describe el motivo de tu solicitud..."></textarea>
            </div>

            <div class="form-group">
                <label>Adjuntar Archivo (Opcional)</label>
                <div class="file-upload-wrapper">
                    <input type="file" (change)="onFileSelect($event)" id="fileInput" class="hidden-input">
                    <label for="fileInput" class="file-label">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span *ngIf="!file">Clic para subir archivo (PDF, JPG, PNG)</span>
                        <span *ngIf="file" class="file-name">{{ file.name }}</span>
                    </label>
                    <button *ngIf="file" (click)="removeFile()" class="btn-remove-file" title="Quitar archivo"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <div class="form-actions">
                <button class="btn-success" (click)="enviar()" [disabled]="uploading">
                    <i class="fas" [ngClass]="uploading ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                    {{ uploading ? 'Enviando...' : 'Enviar Solicitud' }}
                </button>
            </div>
        </div>

        <div class="table-card">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Asunto</th>
                        <th>Adjunto</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let s of solicitudes">
                        <td>{{ s.creadoEn | date:'dd/MM/yyyy' }}</td>
                        <td><span class="type-badge">{{ getTipoNombre(s) }}</span></td>
                        <td>{{ s.asunto }}</td>
                        <td>
                            <button *ngIf="s.urlArchivo" class="btn-icon-view" (click)="verAdjunto(s.urlArchivo)" title="Ver adjunto">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <span *ngIf="!s.urlArchivo" style="color:#ccc;">-</span>
                        </td>
                        <td>
                            <span class="status-badge" [ngClass]="getStatusClass(s.estadoSolicitud?.nombre)">
                                {{ s.estadoSolicitud?.nombre || 'PENDIENTE' }}
                            </span>
                        </td>
                    </tr>
                    <tr *ngIf="solicitudes.length === 0">
                        <td colspan="5" style="text-align:center; padding:40px; color:#888;">
                            <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:10px;"></i>
                            No has realizado solicitudes aún.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
    .header-section h2 { margin: 0; color: #003057; display: flex; align-items: center; gap: 10px; font-size: 1.6rem; }
    .header-section p { margin: 5px 0 0 0; color: #666; }

    /* FORM CARD */
    .form-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 30px; border: 1px solid #e0e0e0; }
    .form-title { margin-top: 0; color: #333; margin-bottom: 20px; font-size: 1.2rem; border-left: 4px solid #003057; padding-left: 10px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 8px; color: #555; font-size: 0.9rem; }
    .form-control { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; transition: border 0.3s; font-size: 0.95rem; }
    .form-control:focus { border-color: #003057; }

    /* FILE INPUT */
    .file-upload-wrapper { display: flex; align-items: center; gap: 10px; }
    .hidden-input { display: none; }
    .file-label { flex-grow: 1; padding: 12px; border: 2px dashed #ccc; border-radius: 8px; cursor: pointer; text-align: center; color: #666; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .file-label:hover { border-color: #003057; background: #f8f9ff; color: #003057; }
    .file-name { font-weight: bold; color: #003057; }
    .btn-remove-file { background: #fee2e2; color: #dc2626; border: none; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; }

    /* BOTONES */
    .form-actions { display: flex; justify-content: flex-end; margin-top: 20px; }
    .btn-primary { background: #003057; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .btn-success { background: #10b981; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; }

    /* TABLA */
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .modern-table { width: 100%; border-collapse: collapse; }
    .modern-table th { background: #f9fafb; padding: 15px; text-align: left; font-size: 0.85rem; color: #6b7280; text-transform: uppercase; font-weight: 600; }
    .modern-table td { padding: 15px; border-top: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
    
    .type-badge { background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-pending { background: #fff7ed; color: #c2410c; }
    .status-approved { background: #ecfdf5; color: #047857; }
    .status-rejected { background: #fef2f2; color: #b91c1c; }
    .btn-icon-view { background: #e0e7ff; color: #4338ca; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }
    
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  `]
})
export class EmpleadoSolicitudesComponent implements OnInit {
  solicitudes: any[] = [];
  showForm = false;
  uploading = false;
  
  nueva = { idTipo: 1, asunto: '', detalle: '' };
  file: File | null = null;

  constructor(private service: GestionCorporativaService) {}

  ngOnInit() { this.cargar(); }
  
  cargar() { this.service.getMisSolicitudes().subscribe(d => this.solicitudes = d); }
  
  toggleForm() { 
      this.showForm = !this.showForm;
      if(!this.showForm) {
          this.nueva = { idTipo: 1, asunto: '', detalle: '' };
          this.file = null;
      }
  }

  onFileSelect(event: any) {
      if (event.target.files.length > 0) {
          this.file = event.target.files[0];
      }
  }

  removeFile() { this.file = null; }

  enviar() {
    if(!this.nueva.asunto || !this.nueva.detalle) {
        Swal.fire('Atención', 'Asunto y detalle son obligatorios', 'warning');
        return;
    }

    this.uploading = true;

    // CREACIÓN DEL FORM DATA (SOLUCIÓN AL ERROR)
    const fd = new FormData();
    fd.append('asunto', this.nueva.asunto);
    fd.append('detalle', this.nueva.detalle);
    fd.append('idTipo', this.nueva.idTipo.toString());
    if (this.file) {
        fd.append('file', this.file);
    }

    this.service.crearSolicitud(fd).subscribe({
        next: () => {
            Swal.fire('Enviado', 'Tu solicitud ha sido registrada', 'success');
            this.toggleForm();
            this.cargar();
            this.uploading = false;
        },
        error: (e) => {
            console.error(e);
            Swal.fire('Error', 'No se pudo enviar la solicitud', 'error');
            this.uploading = false;
        }
    });
  }

  verAdjunto(url: string) { if(url) window.open(url, '_blank'); }

  getTipoNombre(s: any) { return s.tipoSolicitud?.nombre || (s.tipo ? s.tipo : 'General'); }

  getStatusClass(status: string) {
      if(!status) return 'status-pending';
      const s = status.toUpperCase();
      if(s.includes('APROBADO')) return 'status-approved';
      if(s.includes('RECHAZADO')) return 'status-rejected';
      return 'status-pending';
  }
}