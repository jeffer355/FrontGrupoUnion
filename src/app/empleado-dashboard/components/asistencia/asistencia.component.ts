import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../../services/asistencia.service';
import Swal from 'sweetalert2';

// Mantenemos la declaración para no romper el código facial existente
declare var faceapi: any;

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bio-container fade-in">
      <div class="header-section">
        <h2><i class="fas fa-user-clock"></i> Registro de Asistencia</h2>
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
              <span class="sub">Registrar inicio de labores</span>
            </div>
          </button>

          <button class="btn-action btn-exit" 
                  [disabled]="!asistenciaHoy?.horaEntrada || asistenciaHoy?.horaSalida" 
                  (click)="confirmarAccion('SALIDA')">
            <div class="icon"><i class="fas fa-sign-out-alt"></i></div>
            <div class="text">
              <span class="main">MARCAR SALIDA</span>
              <span class="sub">Registrar fin de labores</span>
            </div>
          </button>
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
    .bio-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif; }
    .header-section { text-align: center; margin-bottom: 30px; }
    .header-section h2 { color: #003057; font-size: 2rem; margin-bottom: 5px; }
    .date-display { color: #666; font-size: 1.1rem; }

    /* TARJETA DE ESTADO */
    .status-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px; overflow: hidden; border-left: 5px solid #003057; }
    .status-header { background: #f8f9fa; padding: 15px 20px; font-weight: bold; color: #333; border-bottom: 1px solid #eee; }
    .status-body { display: flex; justify-content: space-around; padding: 20px; }
    .status-item { text-align: center; display: flex; flex-direction: column; gap: 5px; }
    .status-item .label { font-size: 0.85rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .status-item .value { font-size: 1.2rem; font-weight: 600; color: #333; }

    /* BOTONES */
    .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .btn-action { border: none; padding: 25px; border-radius: 15px; cursor: pointer; display: flex; align-items: center; gap: 20px; transition: all 0.3s; color: white; text-align: left; position: relative; overflow: hidden; }
    .btn-action:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); }
    .btn-action:hover:not(:disabled) { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    
    .btn-entry { background: linear-gradient(135deg, #10b981, #059669); }
    .btn-exit { background: linear-gradient(135deg, #ef4444, #b91c1c); }
    
    .btn-action .icon { font-size: 2.5rem; background: rgba(255,255,255,0.2); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .btn-action .text { display: flex; flex-direction: column; }
    .btn-action .main { font-size: 1.2rem; font-weight: 800; letter-spacing: 0.5px; }
    .btn-action .sub { font-size: 0.8rem; opacity: 0.9; }

    .ip-note { text-align: center; margin-top: 20px; color: #aaa; font-size: 0.8rem; }

    /* BADGES */
    .badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: white; font-weight: 600; }
    .bg-green { background-color: #10b981; }
    .bg-orange { background-color: #f59e0b; }
    .bg-red { background-color: #ef4444; }
    .bg-gray { background-color: #6c757d; }

    /* RESPALDO VISUAL BIOMETRÍA */
    .video-container { width: 100%; height: 300px; background: #000; border-radius: 10px; }
    
    @media (max-width: 600px) { .action-buttons { grid-template-columns: 1fr; } }
  `]
})
export class AsistenciaComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoRef!: ElementRef;
  
  // --- CONTROL MAESTRO ---
  biometriaActiva = false; // FALSE = Botones, TRUE = Facial (Código preservado)
  
  fechaActual = new Date();
  asistenciaHoy: any = null;

  // Variables FaceAPI (Preservadas)
  isScanning = false;
  modelLoaded = false;

  constructor(private asistenciaService: AsistenciaService) {}

  ngOnInit() {
    this.cargarDatos();
    if (this.biometriaActiva) this.loadModels();
  }

  ngAfterViewInit() {
    if (this.biometriaActiva) this.startVideo();
  }

  cargarDatos() {
    this.asistenciaService.obtenerHoy().subscribe(data => this.asistenciaHoy = data);
  }

  // Lógica Manual con SweetAlert
  confirmarAccion(tipo: 'ENTRADA' | 'SALIDA') {
    Swal.fire({
      title: `¿Desea marcar ${tipo.toLowerCase()}?`,
      text: "Se registrará la hora exacta y su ubicación IP.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: tipo === 'ENTRADA' ? '#10b981' : '#ef4444',
      confirmButtonText: 'Sí, registrar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarMarcacion(tipo, false);
      }
    });
  }

  procesarMarcacion(tipo: 'ENTRADA' | 'SALIDA', forzar: boolean) {
    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
    
    this.asistenciaService.marcar(tipo, forzar).subscribe({
      next: (res: any) => {
        if (res.status === 'CONFIRMATION_REQUIRED') {
          // Modal Salida Anticipada
          Swal.fire({
            title: 'Salida Anticipada',
            text: res.message, // Mensaje del backend: "¿Está seguro...?"
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, confirmar salida',
            cancelButtonText: 'Cancelar'
          }).then((r) => {
            if (r.isConfirmed) this.procesarMarcacion('SALIDA', true);
          });
        } else {
          Swal.fire('Éxito', res.message, 'success');
          this.cargarDatos();
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

  // --- CÓDIGO FACEAPI (PRESERVADO) ---
  async loadModels() { /* Código original */ }
  startVideo() { /* Código original */ }
}