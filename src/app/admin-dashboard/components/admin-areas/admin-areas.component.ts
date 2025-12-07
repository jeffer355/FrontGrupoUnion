import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Importar
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCrudService } from '../../../services/admin-crud.service';

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crud-container fade-in">
        <div class="crud-header">
            <h2>Gestión de Áreas</h2>
            <button class="btn-add" (click)="openModal()"> <i class="fas fa-plus"></i> Nueva Área</button>
        </div>
        <div class="table-responsive">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let area of listaAreas">
                        <td>{{ area.idDepartamento }}</td>
                        <td><strong>{{ area.nombre }}</strong></td>
                        <td>
                            <button class="action-btn delete" (click)="deleteArea(area.idDepartamento)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-backdrop" *ngIf="showModal">
            <div class="modal-content">
                <h3>Nueva Área</h3>
                <input type="text" [(ngModel)]="tempItem.nombre" class="search-input" placeholder="Nombre del área" style="width: 100%; margin: 10px 0;">
                <div class="modal-actions">
                    <button (click)="closeModal()" class="btn-cancel">Cancelar</button>
                    <button (click)="saveArea()" class="btn-save">Guardar</button>
                </div>
            </div>
        </div>
    </div>
  `,
  styleUrls: ['../../admin-dashboard.component.css']
})
export class AdminAreasComponent implements OnInit {
  listaAreas: any[] = [];
  showModal: boolean = false;
  tempItem: any = {};

  constructor(
      private adminCrudService: AdminCrudService,
      private cdr: ChangeDetectorRef // Inyectar
  ) {}

  ngOnInit() { this.cargarAreas(); }

  cargarAreas() {
    this.adminCrudService.getAreas().subscribe(data => {
        this.listaAreas = data;
        this.cdr.detectChanges(); // ¡EL FIX!
    });
  }

  deleteArea(id: number) {
    if(confirm('¿Eliminar área?')) {
        this.adminCrudService.deleteArea(id).subscribe(() => this.cargarAreas());
    }
  }

  saveArea() {
    this.adminCrudService.saveArea(this.tempItem).subscribe(() => {
        this.closeModal();
        this.cargarAreas();
    });
  }

  openModal() { this.tempItem = {}; this.showModal = true; }
  closeModal() { this.showModal = false; }
}