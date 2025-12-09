import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header"><h2><i class="fas fa-upload"></i> Subir Boletas de Pago</h2></div>
        <div style="max-width: 600px; margin: 0 auto; background: #f8f9fe; padding: 20px; border-radius: 10px;">
            <div class="form-group">
                <label>Empleado</label>
                <select [(ngModel)]="idEmpleado" class="form-control">
                    <option [ngValue]="null">-- Seleccione --</option>
                    <option *ngFor="let e of empleados" [value]="e.idEmpleado">{{ e.persona.nombres }}</option>
                </select>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Mes</label>
                    <select [(ngModel)]="mes" class="form-control">
                        <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="m">{{m}}</option>
                    </select>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Año</label>
                    <input type="number" [(ngModel)]="anio" class="form-control">
                </div>
            </div>
            <div class="form-group">
                <label>Archivo PDF</label>
                <input type="file" (change)="onFile($event)" accept="application/pdf" class="form-control">
            </div>
            <button class="btn-primary" style="width:100%" (click)="subir()">Subir Boleta</button>
        </div>
    </div>
  `
})
export class AdminBoletasComponent implements OnInit {
  empleados: any[] = [];
  
  // CORRECCIÓN: Tipado explícito
  idEmpleado: number | null = null;
  
  mes = new Date().getMonth() + 1;
  anio = new Date().getFullYear();
  file: File | null = null;

  constructor(private service: GestionCorporativaService, private adminService: AdminCrudService) {}

  ngOnInit() { this.adminService.getEmpleados().subscribe(d => this.empleados = d); }
  onFile(e: any) { this.file = e.target.files[0]; }

  subir() {
    if (this.idEmpleado === null || !this.file) { 
        Swal.fire('Error','Faltan datos','error'); 
        return; 
    }
    const fd = new FormData();
    fd.append('idEmpleado', this.idEmpleado.toString());
    fd.append('mes', this.mes.toString());
    fd.append('anio', this.anio.toString());
    fd.append('file', this.file);

    Swal.fire({ title: 'Subiendo...', didOpen: () => Swal.showLoading() });
    this.service.uploadBoleta(fd).subscribe({
        next: () => Swal.fire('Éxito', 'Boleta cargada', 'success'),
        error: () => Swal.fire('Error', 'Fallo al subir', 'error')
    });
  }
}