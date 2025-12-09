import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para filtros
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleado-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container">
        <div class="crud-header">
            <h2><i class="fas fa-file-invoice-dollar" style="color: #003057;"></i> Mis Boletas de Pago</h2>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-end;">
            <div class="form-group" style="margin-bottom: 0;">
                <label>Año</label>
                <select [(ngModel)]="filtroAnio" class="form-control" (change)="filtrar()">
                    <option [value]="2025">2025</option>
                    <option [value]="2024">2024</option>
                    <option [value]="2023">2023</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Mes</label>
                <select [(ngModel)]="filtroMes" class="form-control" (change)="filtrar()">
                    <option value="">Todos</option>
                    <option *ngFor="let m of meses; let i=index" [value]="i+1">{{m}}</option>
                </select>
            </div>
        </div>

        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr><th>Periodo</th><th>Fecha Publicación</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    <tr *ngFor="let b of boletasFiltradas">
                        <td><strong>{{ getNombreMes(b.mes) }} {{ b.anio }}</strong></td>
                        <td>{{ b.fechaSubida | date:'dd/MM/yyyy' }}</td>
                        <td>
                            <span class="badge" 
                                [ngClass]="{'bg-success': b.estado === 'DISPONIBLE', 'bg-danger': b.estado === 'RESTRINGIDA'}">
                                {{ b.estado }}
                            </span>
                        </td>
                        <td>
                            <button *ngIf="b.estado === 'DISPONIBLE'" class="btn-icon btn-download" title="Descargar" (click)="descargar(b.urlArchivo)">
                                <i class="fas fa-download"></i>
                            </button>
                            <button *ngIf="b.estado === 'RESTRINGIDA'" class="btn-icon bg-warning" title="Solicitar Acceso" (click)="solicitarAcceso(b)">
                                <i class="fas fa-lock"></i>
                            </button>
                        </td>
                    </tr>
                    <tr *ngIf="boletasFiltradas.length === 0">
                        <td colspan="4" style="text-align: center; padding: 30px; color: #888;">No se encontraron boletas.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `
})
export class EmpleadoBoletasComponent implements OnInit {
  boletas: any[] = [];
  boletasFiltradas: any[] = [];
  filtroAnio: number = new Date().getFullYear();
  filtroMes: string = "";
  meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  constructor(private service: GestionCorporativaService) {}

  ngOnInit() {
    this.service.getMisBoletas().subscribe(d => {
        this.boletas = d;
        this.filtrar(); // Aplicar filtro inicial
    });
  }

  filtrar() {
    this.boletasFiltradas = this.boletas.filter(b => {
        const matchAnio = b.anio == this.filtroAnio;
        const matchMes = this.filtroMes === "" || b.mes == this.filtroMes;
        return matchAnio && matchMes;
    });
  }
  
  getNombreMes(m: number) { return this.meses[m - 1]; }
  descargar(url: string) { window.open(url, '_blank'); }
  
  solicitarAcceso(b: any) {
    Swal.fire({
        title: 'Boleta Histórica',
        text: '¿Desea solicitar acceso a esta boleta antigua?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, solicitar'
    }).then(r => {
        if(r.isConfirmed) {
            this.service.crearSolicitud({
                asunto: `Acceso Boleta ${b.mes}/${b.anio}`,
                detalle: 'Solicitud automática antigüedad',
                tipoSolicitud: { idTipoSolicitud: 1 }, 
                estadoSolicitud: { idEstado: 1 }
            }).subscribe(() => Swal.fire('Éxito', 'Solicitud enviada', 'success'));
        }
    });
  }
}