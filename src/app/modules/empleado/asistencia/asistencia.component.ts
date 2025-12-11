import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../../services/asistencia.service';
import Swal from 'sweetalert2';

declare var faceapi: any;

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bio-container fade-in">
      
      <div class="header-section" style="border: 2px solid red; padding: 15px; border-radius: 10px;">
        <h2 style="color: #003057; font-weight: bold;">
            <i class="fas fa-user-clock"></i> Registro de Asistencia (VERSIÓN FINAL)
        </h2>
        <p class="date-display">{{ fechaActual | date:'fullDate' | titlecase }}</p>
      </div>

      <div class="manual-panel" *ngIf="!biometriaActiva">
        
        <div class="status-card">
          <div class="status-header">Resumen de Hoy</div>
          <div class="status-body">
            <div class="status-item">
              <span class="label">Entrada</span>
              <span class="value">{{ asistenciaHoy?.horaEntrada ? (asistenciaHoy.horaEntrada | date:'mediumTime') : '--:--' }}</span>
            </div>
            <div class="status-item">
              <span class="label">Salida</span>
              <span class="value">{{ asistenciaHoy?.horaSalida ? (asistenciaHoy.horaSalida | date:'mediumTime') : '--:--' }}</span>
            </div>
            <div class="status-item">
              <span class="label">Estado</span>
              <span class="badge" [ngClass]="getBadgeClass(asistenciaHoy?.estado)">
                {{ asistenciaHoy?.estado || 'PENDIENTE' }}
              </span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-action btn-entry" 
                  [disabled]="asistenciaHoy?.horaEntrada" 
                  (click)="confirmarAccion('ENTRADA')">
            <div class="icon"><i class="fas fa-sign-in-alt"></i></div>
            <div class="text">
              <span class="main">MARCAR ENTRADA</span>
              <span class="sub">Registrar inicio</span>
            </div>
          </button>

          <button class="btn-action btn-exit" 
                  [disabled]="!asistenciaHoy?.horaEntrada || asistenciaHoy?.horaSalida" 
                  (click)="confirmarAccion('SALIDA')">
            <div class="icon"><i class="fas fa-sign-out-alt"></i></div>
            <div class="text">
              <span class="main">MARCAR SALIDA</span>
              <span class="sub">Registrar fin</span>
            </div>
          </button>
        </div>
        
        <div class="reminder-box">
            <div class="reminder-title">RECORDATORIO:</div>
            <div class="reminder-content">
                Recuerda que el horario de asistencia es de 8:00am a 5:00pm.
                <ul>
                    <li>No se considerará horas extras si marcas fuera de horario sin autorización.</li>
                </ul>
            </div>
        </div>

        <div class="history-section mt-4">
            <h3 class="section-title"><i class="fas fa-list-alt"></i> Mis Marcaciones</h3>
            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th>Fecha</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Estado</th>
                            <th style="background-color: #fff3cd; border: 1px solid #ffeeba;">Observación</th> 
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let row of historial">
                            <td>{{ row.fecha | date:'dd/MM/yyyy' }}</td>
                            <td>{{ row.horaEntrada ? (row.horaEntrada | date:'HH:mm:ss') : '--' }}</td>
                            <td>{{ row.horaSalida ? (row.horaSalida | date:'HH:mm:ss') : '--' }}</td>
                            <td>
                                <span class="badge" [ngClass]="getBadgeClass(row.estado)">
                                    {{ row.estado }}
                                </span>
                            </td>
                            <td style="font-style: italic; color: #555; background-color: #fffbf2;">
                                {{ row.observacion || '-' }}
                            </td>
                        </tr>
                        <tr *ngIf="historial.length === 0">
                            <td colspan="5" class="text-center p-3">No hay registros recientes.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="ip-note">
            <i class="fas fa-wifi"></i> Registro auditado por IP y Hostname.
        </div>
      </div>

      <div class="video-container" *ngIf="biometriaActiva" [class.scanning]="isScanning">
        <video #videoElement autoplay muted playsinline></video>
        <canvas #canvasElement class="overlay"></canvas>
        <div class="scan-line" *ngIf="isScanning"></div>
        <p class="text-center mt-2">Sistema facial activo</p>
      </div>

    </div>
  `,
  styles: [`
    .bio-container { max-width: 900px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif; }
    .header-section { text-align: center; margin-bottom: 30px; }
    .date-display { color: #666; font-size: 1.1rem; }

    .status-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px; overflow: hidden; border-left: 5px solid #003057; }
    .status-header { background: #f8f9fa; padding: 15px 20px; font-weight: bold; color: #333; border-bottom: 1px solid #eee; }
    .status-body { display: flex; justify-content: space-around; padding: 20px; }
    .status-item { text-align: center; display: flex; flex-direction: column; gap: 5px; }
    .status-item .label { font-size: 0.85rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .status-item .value { font-size: 1.2rem; font-weight: 600; color: #333; }

    .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .btn-action { border: none; padding: 25px; border-radius: 15px; cursor: pointer; display: flex; align-items: center; gap: 20px; transition: all 0.3s; color: white; text-align: left; position: relative; overflow: hidden; }
    .btn-action:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); }
    .btn-action:hover:not(:disabled) { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    
    .btn-entry { background: linear-gradient(135deg, #10b981, #059669); }
    .btn-exit { background: linear-gradient(135deg, #ef4444, #b91c1c); }
    
    .btn-action .icon { font-size: 2.5rem; background: rgba(255,255,255,0.2); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .btn-action .text { display: flex; flex-direction: column; }
    .btn-action .main { font-size: 1.2rem; font-weight: 800; letter-spacing: 0.5px; }
    .btn-action .sub { font-size: 0.8rem; opacity: 0.9; }

    .reminder-box {
        background-color: #fff8e1; border-left: 5px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 25px; color: #5a4a18;
    }
    .reminder-title { font-weight: bold; margin-bottom: 5px; font-size: 0.95rem; }
    .reminder-content { font-size: 0.9rem; }
    .reminder-content ul { padding-left: 20px; margin: 5px 0 0 0; }

    .section-title { font-size: 1.1rem; color: #003057; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .table-responsive { overflow-x: auto; }
    .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
    .modern-table thead th { color: #8898aa; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; padding: 12px; text-align: left; background: #fff; }
    .modern-table tbody tr { background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
    .modern-table td { padding: 12px; font-size: 0.9rem; color: #555; vertical-align: middle; border-top: 1px solid #f0f0f0; }

    .ip-note { text-align: center; margin-top: 20px; color: #aaa; font-size: 0.8rem; }
    .badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: white; font-weight: 600; }
    .bg-green { background-color: #10b981; }
    .bg-orange { background-color: #f59e0b; }
    .bg-red { background-color: #ef4444; }
    .bg-gray { background-color: #6c757d; }
    .mt-4 { margin-top: 1.5rem; }
    .text-center { text-align: center; }
    .video-container { width: 100%; height: 300px; background: #000; border-radius: 10px; }
    @media (max-width: 600px) { .action-buttons { grid-template-columns: 1fr; } }
  `]
})
export class AsistenciaComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoRef!: ElementRef;
  
  biometriaActiva = false;
  fechaActual = new Date();
  asistenciaHoy: any = null;
  historial: any[] = [];
  isScanning = false;
  modelLoaded = false;

  constructor(
    private asistenciaService: AsistenciaService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarDatos();
    this.cargarHistorial();
    if (this.biometriaActiva) this.loadModels();
  }

  ngAfterViewInit() {
    if (this.biometriaActiva) this.startVideo();
  }

  cargarDatos() {
    this.asistenciaService.obtenerHoy().subscribe({
        next: (d) => { this.asistenciaHoy = d; this.cdr.detectChanges(); },
        error: (e) => console.error(e)
    });
  }

  cargarHistorial() {
      this.asistenciaService.getMisRegistros().subscribe({
          next: (d) => {
              this.historial = d;
              this.cdr.detectChanges();
          }
      });
  }

  confirmarAccion(tipo: 'ENTRADA' | 'SALIDA') {
    const ahora = new Date();
    const hora = ahora.getHours();

    // 1. RESTRICCIONES DE HORARIO LOCALES
    if (tipo === 'ENTRADA' && hora < 8) {
        Swal.fire('Atención', 'No se permite marcar entrada antes de las 8:00 AM.', 'warning');
        return;
    }

    // 2. CONFIGURACIÓN DEL MODAL
    let titulo = `Marcar ${tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}`;
    let texto = "¿Desea agregar una observación? (Opcional)";
    let icon: 'question' | 'warning' = 'question';
    let confirmBtnText = 'Registrar';
    let confirmBtnColor = tipo === 'ENTRADA' ? '#10b981' : '#ef4444';

    // Salida anticipada
    if (tipo === 'SALIDA' && hora < 17) {
        titulo = 'Salida Anticipada';
        texto = 'Estás saliendo antes de las 5:00 PM. Puedes indicar el motivo:';
        icon = 'warning';
        confirmBtnText = 'Registrar Salida';
        confirmBtnColor = '#d33';
    }

    // 3. MOSTRAR SWAL CON INPUT TEXTAREA (Habilitado para todos los casos)
    Swal.fire({
      title: titulo,
      text: texto,
      input: 'textarea', 
      inputPlaceholder: 'Escribe aquí tu observación...',
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmBtnColor,
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // ENVIAR OBSERVACIÓN AL BACKEND
        this.procesarMarcacion(tipo, false, result.value);
      }
    });
  }

  procesarMarcacion(tipo: 'ENTRADA' | 'SALIDA', forzar: boolean, obs: string = '') {
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
    
    // Enviamos la observación al servicio
    this.asistenciaService.marcar(tipo, forzar, obs).subscribe({
      next: (res: any) => {
        if (res.status === 'CONFIRMATION_REQUIRED') {
          // Re-confirmación si el backend lo pide
          Swal.fire({
            title: 'Confirmación Requerida',
            text: res.message, 
            icon: 'warning',
            input: 'textarea', // Volvemos a mostrar input
            inputValue: obs,   // Mantenemos lo escrito
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Confirmar Salida',
            cancelButtonText: 'Cancelar'
          }).then((r) => {
            if (r.isConfirmed) {
                this.procesarMarcacion('SALIDA', true, r.value);
            }
          });
        } else {
          Swal.fire('Éxito', res.message, 'success');
          if (res.data) this.asistenciaHoy = res.data;
          this.cargarDatos();
          this.cargarHistorial(); // Recargar tabla
          this.cdr.detectChanges(); 
        }
      },
      error: (e) => Swal.fire('Error', e.error?.message || 'Error de conexión', 'error')
    });
  }

  getBadgeClass(estado: string): string {
    if (!estado) return 'bg-gray';
    if (estado.includes('PUNTUAL') || estado.includes('NORMAL')) return 'bg-green';
    if (estado.includes('TARDANZA')) return 'bg-orange';
    return 'bg-red';
  }

  async loadModels() {}
  startVideo() {}
}