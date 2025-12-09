import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../services/asistencia.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportes-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        
        <div *ngIf="viewMode === 'GENERAL'">
            <div class="crud-header">
                <h2>Monitor de Asistencia</h2>
                <div class="toolbar">
                    <input type="date" [(ngModel)]="filtroFecha" (change)="cargarGeneral()" class="search-input-table">
                    <div class="divider"></div>
                    <button class="btn-export btn-excel" (click)="exportarGeneralExcel()"><i class="fas fa-file-excel"></i> Excel</button>
                    <button class="btn-export btn-pdf" (click)="exportarGeneralPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr><th>Empleado</th><th>Entrada</th><th>Salida</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let item of listaGeneral">
                            <td>
                                <div><strong>{{ item.empleadoNombre }}</strong></div>
                                <small class="text-muted">{{ item.departamento }}</small>
                            </td>
                            <td>{{ item.horaEntrada ? (item.horaEntrada | date:'HH:mm') : '--:--' }}</td>
                            <td>{{ item.horaSalida ? (item.horaSalida | date:'HH:mm') : '--:--' }}</td>
                            <td><span class="badge" [ngClass]="getClaseEstado(item.estado)">{{ item.estado }}</span></td>
                            <td>
                                <button class="action-btn view" (click)="verIndividual(item)" title="Ver Historial"><i class="fas fa-history"></i></button>
                            </td>
                        </tr>
                        <tr *ngIf="listaGeneral.length === 0">
                            <td colspan="5" style="text-align: center; padding: 20px;">No hay datos para esta fecha.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div *ngIf="viewMode === 'INDIVIDUAL'">
            <div class="crud-header">
                <div class="header-left">
                    <button class="btn-back" (click)="volverAGeneral()"><i class="fas fa-arrow-left"></i></button>
                    <div>
                        <h2>{{ empleadoSeleccionado?.empleadoNombre }}</h2>
                        <small>Historial Completo</small>
                    </div>
                </div>
                <div class="toolbar">
                    <button class="btn-export btn-excel" (click)="exportarIndividualExcel()">Excel Histórico</button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card bg-green"><h3>{{ stats.asistencias }}</h3><p>Asistencias</p></div>
                <div class="stat-card bg-orange"><h3>{{ stats.tardanzas }}</h3><p>Tardanzas</p></div>
                <div class="stat-card bg-red"><h3>{{ stats.faltas }}</h3><p>Faltas</p></div>
                <div class="stat-card bg-purple"><h3>{{ stats.justificadas }}</h3><p>Justificadas</p></div>
            </div>

            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Estado</th><th>Obs.</th><th>Editar</th></tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let h of historialIndividual">
                            <td>{{ h.fecha | date:'dd/MM/yyyy' }}</td>
                            <td>{{ h.horaEntrada ? (h.horaEntrada | date:'HH:mm') : '--' }}</td>
                            <td>{{ h.horaSalida ? (h.horaSalida | date:'HH:mm') : '--' }}</td>
                            <td><span class="badge" [ngClass]="getClaseEstado(h.estado)">{{ h.estado }}</span></td>
                            <td><small>{{ h.observacion }}</small></td>
                            <td>
                                <button class="action-btn edit" (click)="abrirEdicion(h)"><i class="fas fa-pen"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <h3>Editar Registro: {{ itemEdit?.fecha | date:'shortDate' }}</h3>
                <div class="form-group">
                    <label>Hora Entrada</label>
                    <input type="datetime-local" [(ngModel)]="itemEdit.entradaTemp" class="search-input full-width">
                </div>
                <div class="form-group">
                    <label>Hora Salida</label>
                    <input type="datetime-local" [(ngModel)]="itemEdit.salidaTemp" class="search-input full-width">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select [(ngModel)]="itemEdit.estado" class="search-input full-width">
                        <option value="PUNTUAL">PUNTUAL</option>
                        <option value="TARDANZA">TARDANZA</option>
                        <option value="FALTA">FALTA</option>
                        <option value="FALTA JUSTIFICADA">FALTA JUSTIFICADA</option>
                        <option value="SALIDA ANTICIPADA">SALIDA ANTICIPADA</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Observación (Justificación)</label>
                    <textarea [(ngModel)]="itemEdit.observacion" class="search-input full-width"></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn-cancel" (click)="showModal = false">Cancelar</button>
                    <button class="btn-save" (click)="guardarCambios()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .header-left { display: flex; align-items: center; gap: 15px; }
    .btn-back { background: none; border: 1px solid #ccc; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
    .stat-card { padding: 15px; border-radius: 10px; color: white; text-align: center; }
    .stat-card h3 { font-size: 2rem; margin: 0; }
    
    .badge { padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; color: white; }
    .bg-green { background-color: #10b981; }
    .bg-orange { background-color: #f59e0b; }
    .bg-red { background-color: #ef4444; }
    .bg-purple { background-color: #8b5cf6; }
    .bg-gray { background-color: #6b7280; }
    
    .divider { width: 1px; height: 30px; background: #ddd; margin: 0 10px; }
  `],
  styleUrls: ['../../admin-dashboard.component.css']
})
export class ReportesAsistenciaComponent implements OnInit {
  viewMode: 'GENERAL' | 'INDIVIDUAL' = 'GENERAL';
  filtroFecha: string = new Date().toISOString().split('T')[0];
  
  listaGeneral: any[] = [];
  historialIndividual: any[] = [];
  empleadoSeleccionado: any = null;
  
  stats = { asistencias: 0, tardanzas: 0, faltas: 0, justificadas: 0 };
  
  // Edición
  showModal = false;
  itemEdit: any = {};

  constructor(
    private service: AsistenciaService,
    private cdr: ChangeDetectorRef // IMPORTANTE: Inyectar para arreglar el doble clic
  ) {}

  ngOnInit() {
    this.cargarGeneral();
  }

  cargarGeneral() {
    this.service.getReporteDiario(this.filtroFecha).subscribe({
      next: (data) => {
        this.listaGeneral = data;
        this.cdr.detectChanges(); // SOLUCIÓN AL DOBLE CLIC: Forzar actualización de vista
      },
      error: (e) => console.error(e)
    });
  }

  verIndividual(item: any) {
    this.empleadoSeleccionado = item;
    this.viewMode = 'INDIVIDUAL';
    
    this.service.getHistorialEmpleado(item.idEmpleado).subscribe({
      next: (data) => {
        this.historialIndividual = data;
        this.calcularStats();
        this.cdr.detectChanges(); // SOLUCIÓN AL DOBLE CLIC
      },
      error: (e) => console.error(e)
    });
  }

  volverAGeneral() {
    this.viewMode = 'GENERAL';
    this.cargarGeneral(); // Recargar datos frescos
  }

  calcularStats() {
    this.stats = { asistencias: 0, tardanzas: 0, faltas: 0, justificadas: 0 };
    this.historialIndividual.forEach(h => {
      const e = h.estado || '';
      if(e.includes('JUSTIFICADA')) this.stats.justificadas++;
      else if(e.includes('FALTA')) this.stats.faltas++;
      else if(e.includes('TARDANZA')) this.stats.tardanzas++;
      else if(e.includes('PUNTUAL') || e.includes('NORMAL')) this.stats.asistencias++;
    });
  }

  // --- EDICIÓN ---
  abrirEdicion(item: any) {
    this.itemEdit = { ...item };
    if(this.itemEdit.horaEntrada) this.itemEdit.entradaTemp = this.itemEdit.horaEntrada.substring(0,16);
    if(this.itemEdit.horaSalida) this.itemEdit.salidaTemp = this.itemEdit.horaSalida.substring(0,16);
    this.showModal = true;
  }

  guardarCambios() {
    const payload = {
      horaEntrada: this.itemEdit.entradaTemp ? this.itemEdit.entradaTemp + ':00' : null,
      horaSalida: this.itemEdit.salidaTemp ? this.itemEdit.salidaTemp + ':00' : null,
      estado: this.itemEdit.estado,
      observacion: this.itemEdit.observacion
    };
    this.service.updateAsistencia(this.itemEdit.idAsistencia, payload).subscribe(() => {
      Swal.fire('Éxito', 'Registro actualizado', 'success');
      this.showModal = false;
      this.verIndividual(this.empleadoSeleccionado); // Recargar
    });
  }

  getClaseEstado(estado: string): string {
    if (!estado) return 'bg-gray';
    if (estado.includes('INASISTENCIA') || estado.includes('FALTA')) return 'bg-red';
    if (estado.includes('TARDANZA')) return 'bg-orange';
    if (estado.includes('JUSTIFICADA')) return 'bg-purple';
    return 'bg-green';
  }

  // --- EXPORTAR GENERAL CON AUTO-SIZE ---
  exportarGeneralExcel() {
    if(this.listaGeneral.length === 0) return;

    // 1. Preparar datos limpios para Excel
    const datosExcel = this.listaGeneral.map(item => ({
      'Empleado': item.empleadoNombre,
      'Departamento': item.departamento,
      'Fecha': this.filtroFecha,
      'Entrada': item.horaEntrada ? new Date(item.horaEntrada).toLocaleTimeString() : '-',
      'Salida': item.horaSalida ? new Date(item.horaSalida).toLocaleTimeString() : '-',
      'Estado': item.estado || 'INASISTENCIA',
      'IP Origen': item.ip || '-'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExcel);

    // 2. CALCULAR ANCHO DE COLUMNAS AUTOMÁTICO
    const columnWidths = Object.keys(datosExcel[0]).map(key => {
        // Calcular longitud máxima entre el encabezado y el contenido más largo
        const maxContentLength = Math.max(
            key.length,
            ...datosExcel.map((row: any) => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxContentLength + 5 }; // +5 de espacio extra
    });
    
    ws['!cols'] = columnWidths;

    // 3. Guardar
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Diario');
    XLSX.writeFile(wb, `Reporte_${this.filtroFecha}.xlsx`);
  }

  exportarGeneralPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte Diario: ${this.filtroFecha}`, 14, 20);
    autoTable(doc, {
        head: [['Empleado', 'Entrada', 'Salida', 'Estado']],
        body: this.listaGeneral.map(r => [
             r.empleadoNombre,
             r.horaEntrada ? new Date(r.horaEntrada).toLocaleTimeString() : '-',
             r.horaSalida ? new Date(r.horaSalida).toLocaleTimeString() : '-',
             r.estado
        ]),
        startY: 30
    });
    doc.save(`Reporte_${this.filtroFecha}.pdf`);
  }

  // --- EXPORTAR INDIVIDUAL CON AUTO-SIZE ---
  exportarIndividualExcel() {
      if(this.historialIndividual.length === 0) return;

      const data = this.historialIndividual.map(h => ({
          'Fecha': h.fecha,
          'Entrada': h.horaEntrada ? new Date(h.horaEntrada).toLocaleTimeString() : '-',
          'Salida': h.horaSalida ? new Date(h.horaSalida).toLocaleTimeString() : '-',
          'Estado': h.estado,
          'Observación': h.observacion || ''
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

      // Calcular Ancho
      const columnWidths = Object.keys(data[0]).map(key => {
        const maxContentLength = Math.max(
            key.length,
            ...data.map((row: any) => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxContentLength + 5 };
      });
      ws['!cols'] = columnWidths;

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Historial');
      XLSX.writeFile(wb, `Historial_${this.empleadoSeleccionado.empleadoNombre}.xlsx`);
  }
}