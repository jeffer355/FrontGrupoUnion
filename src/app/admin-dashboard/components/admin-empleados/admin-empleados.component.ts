import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Importar
import { CommonModule } from '@angular/common';
import { AdminCrudService } from '../../../services/admin-crud.service';

@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Empleados</h2>
            <button class="btn-add"> <i class="fas fa-plus"></i> Nuevo Empleado</button>
        </div>
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Departamento</th>
                        <th>Cargo</th>
                        <th>Fecha Ingreso</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let emp of listaEmpleados">
                        <td>{{ emp.persona?.nombres }}</td>
                        <td>{{ emp.departamento?.nombre }}</td>
                        <td>{{ emp.cargo?.nombre }}</td>
                        <td>{{ emp.fechaIngreso }}</td>
                        <td><span class="badge badge-active">{{ emp.estado }}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminEmpleadosComponent implements OnInit {
  listaEmpleados: any[] = [];

  constructor(
      private adminCrudService: AdminCrudService,
      private cdr: ChangeDetectorRef // Inyectar
  ) {}

  ngOnInit() {
    this.adminCrudService.getEmpleados().subscribe(data => {
        this.listaEmpleados = data;
        this.cdr.detectChanges(); // ¡EL FIX!
    });
  }
}