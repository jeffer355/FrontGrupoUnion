import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';

@Component({
  selector: 'app-empleado-docs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crud-container">
        <div class="crud-header"><h2><i class="fas fa-folder-open" style="color: #003057;"></i> Mis Documentos</h2></div>
        
        <div class="docs-grid">
            <div class="doc-card" *ngFor="let d of documentos">
                <div class="icon-wrapper">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="doc-info">
                    <h4>{{ d.nombre }}</h4>
                    <span class="badge bg-info">{{ d.tipo }}</span>
                    <p style="font-size: 0.8rem; color: #888; margin-top: 5px;">{{ d.fechaSubida | date:'shortDate' }}</p>
                </div>
                <button class="btn-primary full-width" (click)="ver(d.urlArchivo)">
                    <i class="fas fa-eye"></i> Visualizar
                </button>
            </div>

            <div *ngIf="documentos.length === 0" style="grid-column: 1/-1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: #ccc; margin-bottom: 10px;"></i>
                <p style="color: #666;">No tienes documentos asignados.</p>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .doc-card { 
        background: white; border: 1px solid #eee; border-radius: 12px; padding: 20px; 
        text-align: center; transition: transform 0.2s, box-shadow 0.2s; 
    }
    .doc-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); }
    .icon-wrapper { font-size: 3rem; color: #dc3545; margin-bottom: 15px; }
    .doc-info h4 { margin: 0 0 10px 0; font-size: 1.1rem; color: #333; }
    .full-width { width: 100%; margin-top: 15px; justify-content: center; }
  `]
})
export class EmpleadoDocumentosComponent implements OnInit {
  documentos: any[] = [];
  constructor(private service: GestionCorporativaService) {}
  ngOnInit() { this.service.getMisDocumentos().subscribe(d => this.documentos = d); }
  ver(url: string) { window.open(url, '_blank'); }
}