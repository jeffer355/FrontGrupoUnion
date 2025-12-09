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
    <div class="crud-container">
        <div class="crud-header">
            <h2><i class="fas fa-envelope" style="color: #003057;"></i> Mis Solicitudes</h2>
            <button class="btn-primary" (click)="toggleForm()">
                <i class="fas" [ngClass]="showForm ? 'fa-minus' : 'fa-plus'"></i> Nueva Solicitud
            </button>
        </div>

        <div *ngIf="showForm" style="background: #f8f9ff; padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e0e7ff; animation: fadeIn 0.3s;">
            <h3 style="margin-top: 0; color: #003057; font-size: 1.2rem;">Nueva Solicitud</h3>
            <div class="form-group">
                <label>Tipo de Solicitud</label>
                <select [(ngModel)]="nueva.tipo" class="form-control">
                    <option value="VACACIONES">Vacaciones</option>
                    <option value="DESCANSO_MEDICO">Descanso Médico</option>
                    <option value="CONSTANCIA">Constancia Laboral</option>
                    <option value="OTROS">Otros</option>
                </select>
            </div>
            <div class="form-group">
                <label>Asunto</label>
                <input type="text" [(ngModel)]="nueva.asunto" class="form-control" placeholder="Ej: Vacaciones Noviembre">
            </div>
            <div class="form-group">
                <label>Detalle / Descripción</label>
                <textarea [(ngModel)]="nueva.detalle" class="form-control" rows="3" placeholder="Describe tu solicitud..."></textarea>
            </div>
            <div style="text-align: right;">
                <button class="btn-success" (click)="enviar()">Enviar Solicitud</button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="modern-table">
                <thead><tr><th>Fecha</th><th>Tipo</th><th>Asunto</th><th>Estado</th></tr></thead>
                <tbody>
                    <tr *ngFor="let s of solicitudes">
                        <td>{{ s.creadoEn | date:'shortDate' }}</td>
                        <td><strong style="color: #555;">{{ s.tipo || 'GENERAL' }}</strong></td>
                        <td>{{ s.asunto }}</td>
                        <td>
                            <span class="badge" [ngClass]="{
                                'bg-warning': !s.estadoSolicitud || s.estadoSolicitud.nombre === 'PENDIENTE',
                                'bg-success': s.estadoSolicitud?.nombre === 'APROBADO',
                                'bg-danger': s.estadoSolicitud?.nombre === 'RECHAZADO'
                            }">
                                {{ s.estadoSolicitud?.nombre || 'PENDIENTE' }}
                            </span>
                        </td>
                    </tr>
                    <tr *ngIf="solicitudes.length === 0">
                        <td colspan="4" style="text-align: center; padding: 30px;">No has realizado solicitudes aún.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `
})
export class EmpleadoSolicitudesComponent implements OnInit {
  solicitudes: any[] = [];
  showForm = false;
  nueva = { tipo: 'VACACIONES', asunto: '', detalle: '' };

  constructor(private service: GestionCorporativaService) {}

  ngOnInit() { this.cargar(); }
  
  cargar() { this.service.getMisSolicitudes().subscribe(d => this.solicitudes = d); }
  
  toggleForm() { this.showForm = !this.showForm; }

  // CORRECCIÓN AQUÍ: void explícito
  enviar(): void {
    if(!this.nueva.asunto) {
        // NO USAR 'return Swal...', solo llamar y luego return vacio
        Swal.fire('Atención', 'El asunto es obligatorio', 'warning');
        return; 
    }
    
    const payload = {
        asunto: this.nueva.asunto,
        detalle: this.nueva.detalle,
        tipoSolicitud: { idTipoSolicitud: 1 }, 
        estadoSolicitud: { idEstado: 1 }
    };

    this.service.crearSolicitud(payload).subscribe({
        next: () => {
            Swal.fire('Enviado', 'Tu solicitud ha sido registrada', 'success');
            this.showForm = false;
            this.nueva = { tipo: 'VACACIONES', asunto: '', detalle: '' };
            this.cargar();
        },
        error: () => {
            Swal.fire('Error', 'No se pudo enviar la solicitud', 'error');
        }
    });
  }
}