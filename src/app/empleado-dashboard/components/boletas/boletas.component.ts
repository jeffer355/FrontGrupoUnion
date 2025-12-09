import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // IMPORTAR
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleado-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
        <div class="header-section">
            <h2><i class="fas fa-file-invoice-dollar"></i> Mis Boletas de Pago</h2>
            <p>Consulta y descarga tu historial de pagos mensual.</p>
        </div>

        <div class="filters-card">
            <div class="filter-group">
                <label>Año</label>
                <select [(ngModel)]="filtroAnio" (change)="filtrar()">
                    <option [value]="2025">2025</option>
                    <option [value]="2024">2024</option>
                    <option [value]="2023">2023</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Mes</label>
                <select [(ngModel)]="filtroMes" (change)="filtrar()">
                    <option value="">Todos los meses</option>
                    <option *ngFor="let m of meses; let i=index" [value]="i+1">{{m}}</option>
                </select>
            </div>
        </div>

        <div class="table-card">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Periodo</th>
                        <th>Fecha Publicación</th>
                        <th>Estado</th>
                        <th style="text-align: right;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let b of boletasFiltradas">
                        <td>
                            <div class="period-cell">
                                <span class="month">{{ getNombreMes(b.mes) }}</span>
                                <span class="year">{{ b.anio }}</span>
                            </div>
                        </td>
                        <td style="color: #666;">{{ b.fechaSubida | date:'dd/MM/yyyy' }}</td>
                        <td>
                            <span class="status-badge" 
                                [ngClass]="{'available': b.estado === 'DISPONIBLE', 'restricted': b.estado === 'RESTRINGIDA'}">
                                {{ b.estado }}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <button *ngIf="b.estado === 'DISPONIBLE'" class="btn-action btn-download" (click)="descargar(b.urlArchivo)">
                                <i class="fas fa-download"></i> PDF
                            </button>
                            <button *ngIf="b.estado === 'RESTRINGIDA'" class="btn-action btn-lock" (click)="solicitarAcceso(b)">
                                <i class="fas fa-lock"></i> Solicitar
                            </button>
                        </td>
                    </tr>
                    <tr *ngIf="boletasFiltradas.length === 0">
                        <td colspan="4" class="empty-row">
                            No se encontraron boletas para el periodo seleccionado.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
    .header-section { margin-bottom: 25px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
    .header-section h2 { color: #003057; font-size: 1.8rem; margin: 0; display: flex; align-items: center; gap: 10px; }
    .header-section p { color: #666; margin: 5px 0 0 0; }
    .filters-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .filter-group label { font-weight: 600; color: #555; font-size: 0.9rem; }
    .filter-group select { padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none; }
    .table-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
    .modern-table { width: 100%; border-collapse: collapse; }
    .modern-table thead th { background: #f8f9fa; color: #6c757d; font-weight: 700; text-transform: uppercase; font-size: 0.85rem; padding: 18px; text-align: left; border-bottom: 2px solid #eee; }
    .modern-table tbody tr { border-bottom: 1px solid #f1f1f1; transition: background 0.2s; }
    .modern-table tbody tr:hover { background-color: #f8f9ff; }
    .modern-table td { padding: 15px 18px; vertical-align: middle; }
    .period-cell { display: flex; flex-direction: column; }
    .period-cell .month { font-weight: 700; color: #333; font-size: 1rem; }
    .period-cell .year { color: #888; font-size: 0.85rem; }
    .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-badge.available { background: #d1e7dd; color: #0f5132; }
    .status-badge.restricted { background: #f8d7da; color: #842029; }
    .btn-action { border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; transition: transform 0.2s; }
    .btn-action:hover { transform: translateY(-2px); }
    .btn-download { background: #003057; color: white; }
    .btn-lock { background: #ffc107; color: #333; }
    .empty-row { text-align: center; padding: 40px; color: #999; font-style: italic; }
    .fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  `]
})
export class EmpleadoBoletasComponent implements OnInit {
  boletas: any[] = [];
  boletasFiltradas: any[] = [];
  filtroAnio: number = new Date().getFullYear();
  filtroMes: string = "";
  meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  constructor(
      private service: GestionCorporativaService,
      private cdr: ChangeDetectorRef // INYECTAR
  ) {}

  ngOnInit() {
    this.cargar();
    
    // SUSCRIPCIÓN AUTOMÁTICA
    this.service.refreshNeeded$.subscribe(() => {
        this.cargar();
    });
  }

  cargar() {
    this.service.getMisBoletas().subscribe({
        next: (d) => {
            this.boletas = d;
            this.filtrar();
            this.cdr.detectChanges(); // FORZAR PINTADO
        }
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
  
  descargar(url: string) { 
      if(url) window.open(url, '_blank'); 
      else Swal.fire('Error', 'Enlace roto', 'error');
  }
  
  solicitarAcceso(b: any) {
    Swal.fire({
        title: 'Boleta Histórica',
        text: '¿Solicitar desbloqueo de esta boleta?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, solicitar',
        confirmButtonColor: '#003057'
    }).then(r => {
        if(r.isConfirmed) {
            
            const fd = new FormData();
            fd.append('asunto', `Acceso Boleta ${b.mes}/${b.anio}`);
            fd.append('detalle', 'Solicitud automática por antigüedad > 2 años');
            fd.append('idTipo', '5'); 

            this.service.crearSolicitud(fd).subscribe({
                next: () => {
                    Swal.fire('Listo', 'Solicitud enviada al administrador', 'success');
                    // NO NECESITA LLAMADA EXPLÍCITA PORQUE crearSolicitud DISPARA EL SUBJECT EN EL SERVICIO
                },
                error: (e) => Swal.fire('Error', 'No se pudo enviar la solicitud', 'error')
            });
        }
    });
  }
}