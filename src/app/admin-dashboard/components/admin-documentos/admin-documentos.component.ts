import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionCorporativaService } from '../../../services/gestion-corporativa.service';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-docs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header"><h2><i class="fas fa-folder-plus"></i> Subir Documentos</h2></div>
        <div style="max-width: 600px; margin: 0 auto; background: #f8f9fe; padding: 20px; border-radius: 10px;">
            <div class="form-group">
                <label>Empleado</label>
                <select [(ngModel)]="data.idEmpleado" class="form-control">
                    <option [ngValue]="null">-- Seleccione --</option>
                    <option *ngFor="let e of empleados" [value]="e.idEmpleado">{{ e.persona.nombres }}</option>
                </select>
            </div>
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" [(ngModel)]="data.nombre" class="form-control" placeholder="Ej: Contrato 2025">
            </div>
            <div class="form-group">
                <label>Tipo</label>
                <select [(ngModel)]="data.tipo" class="form-control">
                    <option value="CONTRATO">CONTRATO</option>
                    <option value="CV">CV</option>
                    <option value="OTROS">OTROS</option>
                </select>
            </div>
            <div class="form-group">
                <input type="file" (change)="onFile($event)" class="form-control">
            </div>
            <button class="btn-primary" style="width:100%" (click)="subir()">Guardar</button>
        </div>
    </div>
  `
})
export class AdminDocumentosComponent implements OnInit {
  empleados: any[] = [];
  
  // CORRECCIÓN: Tipado explícito para evitar error TS2339
  data: { idEmpleado: number | null; nombre: string; tipo: string } = { 
      idEmpleado: null, 
      nombre: '', 
      tipo: 'CONTRATO' 
  };
  
  file: File | null = null;

  constructor(private service: GestionCorporativaService, private adminService: AdminCrudService) {}

  ngOnInit() { this.adminService.getEmpleados().subscribe(d => this.empleados = d); }
  onFile(e: any) { this.file = e.target.files[0]; }

  subir() {
    // Validación estricta
    if (this.data.idEmpleado === null || !this.file) { 
        Swal.fire('Error','Faltan datos','error'); 
        return; 
    }

    const fd = new FormData();
    // Al asegurar arriba que no es null, el toString() ya funciona
    fd.append('idEmpleado', this.data.idEmpleado.toString());
    fd.append('nombre', this.data.nombre);
    fd.append('tipo', this.data.tipo);
    fd.append('file', this.file);

    Swal.fire({ title: 'Subiendo...', didOpen: () => Swal.showLoading() });
    this.service.uploadDocumento(fd).subscribe({
        next: () => Swal.fire('Listo', 'Documento guardado', 'success'),
        error: () => Swal.fire('Error', 'No se pudo subir', 'error')
    });
  }
}