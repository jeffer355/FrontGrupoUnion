import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // IMPORTAR ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleado-docs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container fade-in">
        <div class="header-section">
            <h2><i class="fas fa-folder-open"></i> Documentos Laborales</h2>
            <p>Repositorio de tus archivos contractuales y personales.</p>
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
                </div>
                <div class="card-footer">
                    <button class="btn-visualizar" (click)="descargarDirecto(d.urlArchivo)">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                </div>
            </div>

            <div *ngIf="documentos.length === 0" class="empty-state">
                <i class="fas fa-folder-minus"></i>
                <h3>Sin documentos</h3>
                <p>No tienes documentos asignados actualmente.</p>
            </div>
        </div>
    </div>
  `,
  styles: [`
    /* ESTILOS (Mismos que te gustaron, asegurados) */
    .page-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header-section { margin-bottom: 30px; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; }
    .header-section h2 { color: #003057; margin: 0; display: flex; align-items: center; gap: 10px; }
    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .doc-card { background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f0f0f0; display: flex; flex-direction: column; transition: transform 0.2s; }
    .doc-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    .card-icon { background: #fdf2f2; color: #dc3545; padding: 20px; text-align: center; font-size: 3rem; }
    .card-body { padding: 15px; text-align: center; flex-grow: 1; }
    .card-body h4 { margin: 0 0 10px; font-size: 1.1rem; color: #333; }
    .badge { background: #e3f2fd; color: #0277bd; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: bold; }
    .date { margin-top: 10px; font-size: 0.8rem; color: #888; }
    .card-footer { padding: 15px; background: #fafafa; border-top: 1px solid #eee; }
    .btn-visualizar { width: 100%; background: #003057; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-visualizar:hover { background: #002240; }
    .empty-state { grid-column: 1/-1; text-align: center; padding: 40px; border: 2px dashed #ddd; border-radius: 10px; color: #777; }
    .empty-state i { font-size: 3rem; margin-bottom: 10px; color: #ccc; }
    .loading-state { text-align: center; padding: 30px; font-size: 1.2rem; color: #666; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 10px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class EmpleadoDocumentosComponent implements OnInit {
  documentos: any[] = [];
  loading = true;

  constructor(
    private service: GestionCorporativaService,
    private cdr: ChangeDetectorRef // INYECCIÓN NECESARIA
  ) {}

  ngOnInit() { 
    this.service.getMisDocumentos().subscribe({
        next: (d) => {
            this.documentos = d;
            this.loading = false;
            this.cdr.detectChanges(); // <-- ESTO ARREGLA EL PROBLEMA DEL "DOBLE CLIC"
        },
        error: () => {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }); 
  }

  getIcono(url: string) {
      if (!url) return 'fa-file';
      if (url.endsWith('.pdf')) return 'fa-file-pdf';
      if (url.match(/\.(jpeg|jpg|png)$/)) return 'fa-file-image';
      return 'fa-file-alt';
  }

  descargarDirecto(url: string) {
    if (!url) { Swal.fire('Error', 'URL no válida', 'error'); return; }

    // TRUCO DE CLOUDINARY: Insertar "fl_attachment" en la URL fuerza la descarga
    // Transforma: .../upload/v123... -> .../upload/fl_attachment/v123...
    let downloadUrl = url;
    if (url.includes('/upload/')) {
        downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
    }

    // Crear un elemento temporal para forzar la descarga
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank'; // Por seguridad
    link.download = 'Documento_GrupoUnion'; // Nombre sugerido
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}