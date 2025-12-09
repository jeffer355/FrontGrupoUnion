import { Component, OnInit } from '@angular/core';
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
                <thead><tr><th>Empleado</th><th>Fecha</th><th>Asunto</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                    <tr *ngFor="let s of solicitudes">
                        <td>
                            <strong>{{ s.empleado?.persona?.nombres }}</strong><br>
                            <small>{{ s.empleado?.departamento?.nombre }}</small>
                        </td>
                        <td>{{ s.creadoEn | date:'short' }}</td>
                        <td>{{ s.asunto }}</td>
                        <td><span class="badge bg-warning">{{ s.estadoSolicitud?.nombre || 'PENDIENTE' }}</span></td>
                        <td>
                            <div style="display:flex; gap:5px;">
                                <button class="btn-success" title="Aprobar" (click)="gestionar(s, 2)"><i class="fas fa-check"></i></button>
                                <button class="btn-danger" title="Rechazar" (click)="gestionar(s, 3)"><i class="fas fa-times"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="solicitudes.length === 0"><td colspan="5" style="text-align:center;">No hay solicitudes pendientes.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
  `
})
// AQUÍ ESTABA EL ERROR: AHORA SE LLAMA CORRECTAMENTE 'AdminSolicitudesComponent'
export class AdminSolicitudesComponent implements OnInit {
  solicitudes: any[] = [];
  constructor(private service: GestionCorporativaService) {}
  
  ngOnInit() { this.cargar(); }
  
  cargar() { 
      this.service.getAllSolicitudesAdmin().subscribe(d => this.solicitudes = d); 
  }

  gestionar(solicitud: any, idEstado: number) {
      Swal.fire({ title: 'Confirmar acción', showCancelButton: true }).then(r => {
          if(r.isConfirmed) {
              console.log("Cambiando estado a", idEstado);
              Swal.fire('Listo', 'Estado actualizado', 'success');
          }
      });
  }
}