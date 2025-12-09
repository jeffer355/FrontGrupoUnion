import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- CORRECCIÓN DE RUTAS ---
// Salimos 3 niveles: ../ (admin-dashboard) -> ../ (admin) -> ../ (modules) -> llegamos a 'app'
import { AdminCrudService } from '../../../services/admin-crud.service'; 

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reportes-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Reporte de Asistencias y Faltas</h2>
            <div class="toolbar">
                <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" placeholder="Buscar empleado..." class="search-input-table" [(ngModel)]="searchText" (keyup)="filtrar()">
                </div>
                
                <button class="btn-export btn-excel" (click)="exportarExcel()">
                    <i class="fas fa-file-excel"></i> Excel
                </button>
                <button class="btn-export btn-pdf" (click)="exportarPDF()">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Fecha</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let a of listaFiltrada">
                        <td>
                            <div class="user-cell">
                                <span style="font-weight:bold;">{{ a.empleadoNombre }}</span>
                            </div>
                        </td>
                        <td>{{ a.fecha }}</td>
                        <td>{{ a.horaEntrada || '--:--' }}</td>
                        <td>{{ a.horaSalida || '--:--' }}</td>
                        <td>
                            <span class="badge" 
                                [ngClass]="{
                                    'badge-active': a.estado === 'PUNTUAL' || a.estado === 'ASISTIO', 
                                    'badge-inactive': a.estado === 'FALTA' || a.estado === 'TARDANZA'
                                }">
                                {{ a.estado }}
                            </span>
                        </td>
                    </tr>
                    <tr *ngIf="listaFiltrada.length === 0">
                        <td colspan="5" style="text-align:center; padding: 20px;">No hay registros disponibles.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `,
  // --- CORRECCIÓN DE RUTA DE ESTILOS ---
  // Debe apuntar al CSS del componente padre (admin-dashboard) que está en 'src/app/admin-dashboard'
  styleUrls: ['../../../admin-dashboard/admin-dashboard.component.css'] 
})
export class ReportesAsistenciaComponent implements OnInit {
  listaAsistencias: any[] = [];
  listaFiltrada: any[] = [];
  searchText = '';

  constructor(private service: AdminCrudService) {}

  ngOnInit() {
    // Aquí llamamos al servicio para obtener los datos reales (simulado por ahora si no tienes el endpoint)
    // Asegúrate de agregar el método 'getAsistencias()' en tu AdminCrudService
    this.cargarDatosSimulados(); 
  }

  cargarDatosSimulados() {
      // ESTO ES TEMPORAL HASTA QUE TENGAS EL BACKEND LISTO
      this.listaAsistencias = [
          { empleadoNombre: 'Jeffer Carpio', fecha: '2023-10-25', horaEntrada: '08:00:00', horaSalida: '17:00:00', estado: 'PUNTUAL' },
          { empleadoNombre: 'Maria Lopez', fecha: '2023-10-25', horaEntrada: '08:15:00', horaSalida: '17:00:00', estado: 'TARDANZA' },
          { empleadoNombre: 'Carlos Ruiz', fecha: '2023-10-25', horaEntrada: null, horaSalida: null, estado: 'FALTA' }
      ];
      this.filtrar();
  }

  filtrar() {
    if (!this.searchText) {
        this.listaFiltrada = this.listaAsistencias;
    } else {
        const text = this.searchText.toLowerCase();
        this.listaFiltrada = this.listaAsistencias.filter(x => 
            x.empleadoNombre.toLowerCase().includes(text) || x.fecha.includes(text)
        );
    }
  }

  exportarExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.listaFiltrada);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
    XLSX.writeFile(wb, 'Reporte_Asistencias.xlsx');
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text('Reporte de Asistencias - Grupo Unión', 14, 20);
    
    autoTable(doc, {
        head: [['Empleado', 'Fecha', 'Entrada', 'Salida', 'Estado']],
        body: this.listaFiltrada.map(a => [a.empleadoNombre, a.fecha, a.horaEntrada, a.horaSalida, a.estado]),
        startY: 30,
    });
    doc.save('Reporte_Asistencias.pdf');
  }
}