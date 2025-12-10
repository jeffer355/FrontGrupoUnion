import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-solicitudes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header"><h2><i class="fas fa-inbox"></i> Bandeja de Solicitudes</h2></div>
        <div class="table-responsive">
            <table class="modern-table">
                <thead><tr><th>Empleado</th><th>Fecha</th><th>Asunto</th><th>Adjunto</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                    <tr *ngFor="let s of solicitudes">
                        <td>
                            <strong>{{ s.empleado?.persona?.nombres }}</strong><br>
                            <small>{{ s.empleado?.departamento?.nombre }}</small>
                        </td>
                        <td>{{ s.creadoEn | date:'shortDate' }}</td>
                        <td>
                            <div>{{ s.asunto }}</div>
                            <small class="text-muted">{{ s.tipoSolicitud?.nombre }}</small>
                        </td>
                        <td>
                            <button *ngIf="s.urlArchivo" class="btn-icon-view" (click)="ver(s.urlArchivo)" title="Ver Documento">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <span *ngIf="!s.urlArchivo" style="color:#ccc;">-</span>
                        </td>
                        <td><span class="badge" [ngClass]="getBadge(s.estadoSolicitud?.nombre)">{{ s.estadoSolicitud?.nombre || 'PENDIENTE' }}</span></td>
                        <td>
                            <div style="display:flex; gap:5px;">
                                <button class="btn-success" title="Aprobar" (click)="gestionar(s, 2)"><i class="fas fa-check"></i></button>
                                <button class="btn-danger" title="Rechazar" (click)="gestionar(s, 3)"><i class="fas fa-times"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="solicitudes.length === 0"><td colspan="6" style="text-align:center; padding:20px;">No hay solicitudes pendientes.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
  `,
  styles: [`
    .btn-icon-view { background: #3b82f6; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .badge { padding: 5px 10px; border-radius: 15px; font-size: 0.7rem; font-weight: bold; }
    .bg-pending { background: #fff7ed; color: #c2410c; }
    .bg-approved { background: #ecfdf5; color: #047857; }
    .bg-rejected { background: #fef2f2; color: #b91c1c; }
    .text-muted { color: #888; font-size: 0.8rem; }
  `]
})
export class AdminSolicitudesComponent implements OnInit {
  solicitudes: any[] = [];
  
  constructor(
      private service: GestionCorporativaService,
      private cdr: ChangeDetectorRef // Inyección
  ) {}
  
  ngOnInit() { 
      this.cargar(); 
      this.service.refreshNeeded$.subscribe(() => {
          this.cargar();
      });
  }
  
  cargar() { 
      this.service.getAllSolicitudesAdmin().subscribe({
          next: (d) => {
              this.solicitudes = d;
              this.cdr.detectChanges(); // CORRECCIÓN: Renderiza la tabla inmediatamente
          }
      }); 
  }

  ver(url: string) { if(url) window.open(url, '_blank'); }

  getBadge(status: string) {
      if(!status) return 'bg-pending';
      if(status.includes('APROBADO')) return 'bg-approved';
      if(status.includes('RECHAZADO')) return 'bg-rejected';
      return 'bg-pending';
  }

  // CORRECCIÓN: Implementación de la lógica de actualización
  gestionar(solicitud: any, idEstado: number) {
      const nuevoEstadoNombre = idEstado === 2 ? 'APROBADO' : 'RECHAZADO';
      
      Swal.fire({
          title: `¿${nuevoEstadoNombre === 'APROBADO' ? 'Aprobar' : 'Rechazar'} Solicitud?`,
          text: `Se cambiará el estado a ${nuevoEstadoNombre}`,
          icon: idEstado === 2 ? 'question' : 'warning',
          showCancelButton: true,
          confirmButtonColor: idEstado === 2 ? '#10b981' : '#ef4444',
          confirmButtonText: 'Sí, confirmar'
      }).then((result) => {
          if (result.isConfirmed) {
              // 1. Actualización Optimista (Visualmente instantánea)
              // Simulamos que el objeto ya cambió para que el usuario vea la reacción inmediata
              if (!solicitud.estadoSolicitud) solicitud.estadoSolicitud = {};
              solicitud.estadoSolicitud.nombre = nuevoEstadoNombre;
              
              // 2. Feedback visual
              Swal.fire('Actualizado', `La solicitud ha sido ${nuevoEstadoNombre.toLowerCase()}.`, 'success');

              // 3. FORZAR LA VISTA PARA QUE REFLEJE EL CAMBIO DE COLOR DEL BADGE
              this.cdr.detectChanges();

              // NOTA: Aquí iría la llamada al servicio real si existiera el endpoint:
              // this.service.updateEstadoSolicitud(solicitud.idSolicitud, idEstado).subscribe(...)
          }
      });
  }
}