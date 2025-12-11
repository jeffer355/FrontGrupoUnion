import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Empleados</h2>
            
            <div class="toolbar">
                <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" 
                           placeholder="Buscar empleado..." 
                           class="search-input-table"
                           [(ngModel)]="searchText"
                           (keyup)="filtrar()">
                </div>

                <button class="btn-export btn-excel" (click)="exportarExcel()" title="Descargar Excel">
                    <i class="fas fa-file-excel"></i> Excel
                </button>
                <button class="btn-export btn-pdf" (click)="exportarPDF()" title="Descargar PDF">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>

                <button class="btn-add" (click)="openModal('crear')">
                    <i class="fas fa-plus"></i> Nuevo
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr><th>Nombre</th><th>Documento</th><th>Departamento</th><th>Cargo</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    <tr *ngFor="let emp of listaFiltrada">
                        <td><div style="font-weight:bold;">{{ emp.persona?.nombres }}</div><small>{{ emp.persona?.email }}</small></td>
                        <td>{{ emp.persona?.nroDocumento }}</td>
                        <td>{{ emp.departamento?.nombre }}</td>
                        <td>{{ emp.cargo?.nombre }}</td>
                        <td>
                             <label class="switch">
                                <input type="checkbox" [checked]="emp.estado === 'ACTIVO'" (change)="toggleEstado(emp)">
                                <span class="slider"></span>
                            </label>
                            <span class="switch-label">{{ emp.estado }}</span>
                        </td>
                        <td>
                            <button class="action-btn view" (click)="verDetalles(emp)"><i class="fas fa-eye"></i></button>
                            <button class="action-btn edit" (click)="openModal('editar', emp)"><i class="fas fa-pen"></i></button>
                            <button class="action-btn delete" (click)="deleteEmpleado(emp.idEmpleado)"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr *ngIf="listaFiltrada.length === 0">
                        <td colspan="6" style="text-align: center; padding: 20px; color: #666;">No se encontraron empleados.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content scrollable-modal">
                <h3>{{ isEditMode ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
                <div class="form-grid">
                    <div class="form-column">
                        <h4 class="section-title">Datos Personales</h4>
                        <div class="form-group"><label>Nombres</label><input type="text" [(ngModel)]="tempItem.persona.nombres" class="search-input full-width"></div>
                        <div class="form-row">
                            <div class="form-group half"><label>Tipo Doc</label>
                                <select [(ngModel)]="tempItem.persona.tipoDocumento.idTipoDoc" class="search-input full-width">
                                    <option *ngFor="let t of listaTiposDoc" [value]="t.idTipoDoc">{{ t.nombre }}</option>
                                </select>
                            </div>
                            <div class="form-group half"><label>Nro Doc</label><input type="text" [(ngModel)]="tempItem.persona.nroDocumento" class="search-input full-width"></div>
                        </div>
                        <div class="form-group"><label>Fecha Nac.</label><input type="date" [(ngModel)]="tempItem.persona.fechaNac" class="search-input full-width"></div>
                        <div class="form-group"><label>Teléfono</label><input type="text" [(ngModel)]="tempItem.persona.telefono" class="search-input full-width"></div>
                    </div>
                    <div class="form-column">
                        <h4 class="section-title">Datos Laborales</h4>
                        <div class="form-group"><label>Dirección</label><input type="text" [(ngModel)]="tempItem.persona.direccion" class="search-input full-width"></div>
                        <div class="form-group"><label>Email Corp.</label><input type="email" [(ngModel)]="tempItem.persona.email" class="search-input full-width"></div>
                        
                        <div class="form-group"><label>Departamento</label>
                            <select [(ngModel)]="tempItem.departamento.idDepartamento" class="search-input full-width">
                                <option *ngFor="let a of listaAreas" [value]="a.idDepartamento">{{ a.nombre }}</option>
                            </select>
                        </div>

                        <div class="form-group"><label>Cargo</label>
                            <select [(ngModel)]="tempItem.cargo.idCargo" class="search-input full-width">
                                <option *ngFor="let c of listaCargos" [value]="c.idCargo">{{ c.nombre }}</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Fecha Ingreso</label><input type="date" [(ngModel)]="tempItem.fechaIngreso" class="search-input full-width"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button (click)="closeModal()" class="btn-cancel">Cancelar</button>
                    <button (click)="guardarEmpleado()" class="btn-save">Guardar</button>
                </div>
            </div>
        </div>

        <div class="modal-backdrop" *ngIf="showDetailModal">
            <div class="modal-content">
                <h3>Ficha del Empleado</h3>
                <div class="detail-row"><strong>Nombre:</strong> {{ selectedItem?.persona?.nombres }}</div>
                <div class="detail-row"><strong>Email:</strong> {{ selectedItem?.persona?.email }}</div>
                <div class="detail-row"><strong>Teléfono:</strong> {{ selectedItem?.persona?.telefono }}</div>
                <div class="detail-row"><strong>Departamento:</strong> {{ selectedItem?.departamento?.nombre }}</div>
                <div class="detail-row"><strong>Cargo:</strong> {{ selectedItem?.cargo?.nombre }}</div>
                <div class="detail-row"><strong>Estado:</strong> {{ selectedItem?.estado }}</div>
                <div class="modal-actions"><button (click)="closeDetailModal()" class="btn-save">Cerrar</button></div>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .section-title { color: #e60000; font-size: 0.9rem; font-weight: bold; border-bottom: 2px solid #f9f9f9; padding-bottom: 5px; margin-bottom: 15px; }
    .form-row { display: flex; gap: 15px; } .half { flex: 1; }
    .scrollable-modal { width: 800px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; margin-right: 10px; vertical-align: middle; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #10b981; }
    input:checked + .slider:before { transform: translateX(20px); }
    .switch-label { font-size: 0.8rem; font-weight: 600; color: #555; vertical-align: middle; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `],
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminEmpleadosComponent implements OnInit {
  listaEmpleados: any[] = [];
  listaFiltrada: any[] = [];
  searchText: string = '';
  
  listaAreas: any[] = []; 
  listaTiposDoc: any[] = [];
  listaCargos: any[] = []; // NUEVA LISTA

  showModal = false; showDetailModal = false; isEditMode = false;
  tempItem: any = this.initEmpty(); selectedItem: any = null;

  constructor(private service: AdminCrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.service.getEmpleados().subscribe(d => { 
        this.listaEmpleados = d; 
        this.filtrar(); 
        this.cdr.detectChanges(); 
    });
    this.service.getAreas().subscribe(d => this.listaAreas = d);
    this.service.getTiposDocumento().subscribe(d => this.listaTiposDoc = d);
    
    // --- CARGAR CARGOS AL INICIAR ---
    this.service.getCargos().subscribe(d => this.listaCargos = d);
  }

  filtrar() {
      if (!this.searchText) {
          this.listaFiltrada = this.listaEmpleados;
      } else {
          const texto = this.searchText.toLowerCase();
          this.listaFiltrada = this.listaEmpleados.filter(e => 
              e.persona?.nombres.toLowerCase().includes(texto) ||
              e.persona?.nroDocumento.includes(texto) ||
              e.departamento?.nombre.toLowerCase().includes(texto)
          );
      }
  }

  exportarExcel() {
      if (this.listaFiltrada.length === 0) {
          Swal.fire('Atención', 'No hay datos para exportar', 'info');
          return;
      }
      const datosParaExcel = this.listaFiltrada.map(e => ({
          'Nombre Completo': e.persona?.nombres,
          'DNI': e.persona?.nroDocumento,
          'Email': e.persona?.email,
          'Departamento': e.departamento?.nombre,
          'Cargo': e.cargo?.nombre,
          'Fecha Ingreso': e.fechaIngreso,
          'Estado': e.estado
      }));
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel);
      const keys = Object.keys(datosParaExcel[0]);
      const columnWidths = keys.map(key => {
          let maxLength = key.length;
          datosParaExcel.forEach(row => {
              const value = (row as any)[key] ? (row as any)[key].toString() : "";
              if (value.length > maxLength) { maxLength = value.length; }
          });
          return { wch: maxLength + 3 };
      });
      ws['!cols'] = columnWidths;
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
      XLSX.writeFile(wb, 'Reporte_Empleados_GrupoUnion.xlsx');
  }

  exportarPDF() {
      if (this.listaFiltrada.length === 0) {
          Swal.fire('Atención', 'No hay datos para exportar', 'info');
          return;
      }
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Reporte de Empleados - Grupo Unión', 14, 20);
      doc.setFontSize(10);
      doc.text('Fecha: ' + new Date().toLocaleDateString(), 14, 28);

      const columnas = [['Nombre', 'DNI', 'Departamento', 'Cargo', 'Estado']];
      const data = this.listaFiltrada.map(e => [
          e.persona?.nombres,
          e.persona?.nroDocumento,
          e.departamento?.nombre,
          e.cargo?.nombre,
          e.estado
      ]);

      autoTable(doc, {
          head: columnas,
          body: data,
          startY: 35,
          theme: 'grid',
          headStyles: { fillColor: [230, 0, 0] }
      });

      doc.save('Reporte_Empleados.pdf');
  }

  toggleEstado(e:any){
      const n=e.estado==='ACTIVO'?'CESADO':'ACTIVO'; e.estado=n;
      this.service.updateEmpleado({...e}).subscribe({error:()=>e.estado=n==='ACTIVO'?'CESADO':'ACTIVO'});
  }
  
  // INICIALIZADOR DE OBJETO VACÍO
  initEmpty(){ 
      return { 
          persona:{
              nombres:'', nroDocumento:'', fechaNac:'', telefono:'', email:'', direccion:'', 
              tipoDocumento:{idTipoDoc:1}
          }, 
          departamento:{idDepartamento:null}, 
          cargo:{idCargo:null}, // Inicializar Cargo
          fechaIngreso:new Date().toISOString().split('T')[0], 
          estado:'ACTIVO'
      } 
  }
  
  openModal(m:any,i?:any){ 
      this.isEditMode=m==='editar'; 
      this.tempItem=i?JSON.parse(JSON.stringify(i)):this.initEmpty(); 
      if(this.isEditMode){
          if(this.tempItem.persona.fechaNac)this.tempItem.persona.fechaNac=this.tempItem.persona.fechaNac.split('T')[0]; 
          if(this.tempItem.fechaIngreso)this.tempItem.fechaIngreso=this.tempItem.fechaIngreso.split('T')[0];
      } 
      this.showModal=true; 
  }
  
  guardarEmpleado(){ 
      // Validación incluyendo Cargo
      if(!this.tempItem.persona.nombres || !this.tempItem.departamento.idDepartamento || !this.tempItem.cargo.idCargo){
          Swal.fire('Atención','Complete todos los datos requeridos (incluyendo cargo)','warning');
          return;
      }
      const req=this.isEditMode?this.service.updateEmpleado(this.tempItem):this.service.createEmpleado(this.tempItem);
      req.subscribe({
          next:()=>{this.ngOnInit();this.closeModal();Swal.fire('Éxito','Guardado','success');},
          error:(e)=>Swal.fire('Error',e.error?.message,'error')
      });
  }
  
  deleteEmpleado(id:number){ Swal.fire({title:'¿Eliminar?',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33'}).then((r)=>{if(r.isConfirmed)this.service.deleteEmpleado(id).subscribe(()=>this.ngOnInit())}); }
  verDetalles(i:any){this.selectedItem=i;this.showDetailModal=true;}
  closeModal(){this.showModal=false;}
  closeDetailModal(){this.showDetailModal=false;}
}