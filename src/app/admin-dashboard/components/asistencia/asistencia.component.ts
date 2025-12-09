import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiometriaService } from '../../../services/biometria.service'; // Ajusta la ruta si es necesario
import Swal from 'sweetalert2';

// Declaramos la variable global para face-api
declare var faceapi: any;

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bio-container fade-in">
      <div class="bio-header">
        <h2><i class="fas fa-id-card-alt"></i> Control de Asistencia Facial</h2>
        <p>Por favor, ubícate frente a la cámara para registrar tu asistencia.</p>
      </div>
      
      <div class="scan-wrapper">
        <div class="video-container" [class.scanning]="isScanning">
          <video #videoElement autoplay muted playsinline></video>
          <canvas #canvasElement class="overlay"></canvas>
          
          <div class="scan-line" *ngIf="isScanning"></div>
          
          <div class="video-status" *ngIf="!modelLoaded">
             <i class="fas fa-circle-notch fa-spin"></i> Cargando Inteligencia Artificial...
          </div>
        </div>
        
        <div class="controls-panel">
          <div class="status-indicator" [ngClass]="{'ready': modelLoaded, 'error': !modelLoaded}">
             {{ statusMessage }}
          </div>

          <div *ngIf="modelLoaded" class="actions-grid">
            <button *ngIf="!isEnrolado" class="btn-action btn-register" (click)="iniciarProceso('REGISTRO')">
              <div class="icon-box"><i class="fas fa-user-plus"></i></div>
              <span>Registrar mi Rostro<br><small>(Primera vez)</small></span>
            </button>

            <ng-container *ngIf="isEnrolado">
              <button class="btn-action btn-entry" (click)="iniciarProceso('ENTRADA')">
                <div class="icon-box"><i class="fas fa-sign-in-alt"></i></div>
                <span>Marcar Entrada</span>
              </button>
              
              <button class="btn-action btn-exit" (click)="iniciarProceso('SALIDA')">
                <div class="icon-box"><i class="fas fa-sign-out-alt"></i></div>
                <span>Marcar Salida</span>
              </button>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bio-container { max-width: 900px; margin: 0 auto; padding: 20px; animation: fadeIn 0.5s ease-out; }
    .bio-header { text-align: center; margin-bottom: 30px; color: #333; }
    .bio-header h2 { font-size: 1.8rem; margin-bottom: 10px; color: #3969FC; }
    
    .scan-wrapper { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; gap: 30px; }
    
    .video-container { position: relative; width: 100%; max-width: 500px; height: 380px; background: #000; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); /* Efecto espejo */ }
    .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    
    .video-status { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 1.2rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); width: 100%; text-align: center; }

    .scan-line { position: absolute; width: 100%; height: 3px; background: #00ff00; top: 0; left: 0; box-shadow: 0 0 15px #00ff00; animation: scan 2.5s infinite linear; z-index: 10; opacity: 0.7; }
    @keyframes scan { 0% {top: 0;} 50% {top: 100%;} 100% {top: 0;} }

    .controls-panel { width: 100%; text-align: center; }
    .status-indicator { display: inline-block; padding: 8px 20px; border-radius: 30px; background: #f0f0f0; font-weight: 600; margin-bottom: 25px; font-size: 0.95rem; }
    .status-indicator.ready { background: #dcfce7; color: #166534; }
    .status-indicator.error { background: #fee2e2; color: #991b1b; }

    .actions-grid { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
    
    .btn-action { border: none; background: white; border-radius: 15px; padding: 20px; width: 160px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 2px solid transparent; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .btn-action:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .icon-box { font-size: 2rem; margin-bottom: 5px; }
    
    .btn-register { border-color: #3969FC; color: #3969FC; }
    .btn-register:hover { background: #3969FC; color: white; }
    
    .btn-entry { border-color: #10b981; color: #10b981; }
    .btn-entry:hover { background: #10b981; color: white; }
    
    .btn-exit { border-color: #ef4444; color: #ef4444; }
    .btn-exit:hover { background: #ef4444; color: white; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AsistenciaComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoRef!: ElementRef;
  
  isEnrolado = false;
  modelLoaded = false;
  isScanning = false;
  statusMessage = 'Inicializando sistema...';
  stream: any;

  constructor(private bioService: BiometriaService) {}

  ngOnInit() {
    this.checkEstadoUsuario();
    this.loadModels();
  }

  ngAfterViewInit() {
    this.startVideo();
  }

  // Verifica si el usuario ya tiene su cara registrada
  checkEstadoUsuario() {
    this.bioService.checkEstado().subscribe({
      next: (res) => {
        this.isEnrolado = res.enrolado;
        this.statusMessage = this.isEnrolado ? 'Sistema listo. Seleccione una acción.' : '⚠️ Rostro no registrado. Regístrese primero.';
      },
      error: () => this.statusMessage = 'Error de conexión con el servidor.'
    });
  }

  // Carga los modelos de face-api.js desde la carpeta assets
  async loadModels() {
    const MODEL_URL = '/assets/models';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      this.modelLoaded = true;
      if(this.isEnrolado) this.statusMessage = 'Sistema listo. Seleccione una acción.';
    } catch (e) {
      console.error('Error models', e);
      Swal.fire('Error', 'No se pudieron cargar los modelos de IA. Verifique la carpeta assets.', 'error');
    }
  }

  // Enciende la cámara
  startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        this.videoRef.nativeElement.srcObject = stream;
        this.stream = stream;
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo acceder a la cámara', 'error');
      });
  }

  // Lógica principal de escaneo
  async iniciarProceso(accion: 'REGISTRO' | 'ENTRADA' | 'SALIDA') {
    if (!this.modelLoaded) return;
    this.isScanning = true;
    this.statusMessage = 'Analizando rostro... no te muevas.';

    // Detección
    const detections = await faceapi.detectSingleFace(
      this.videoRef.nativeElement, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();

    this.isScanning = false;

    if (detections) {
      const embedding = Array.from(detections.descriptor);

      if (accion === 'REGISTRO') {
        this.bioService.registrarRostro(embedding as number[]).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Rostro registrado correctamente' });
            this.isEnrolado = true;
            this.statusMessage = 'Rostro guardado. Ahora puede marcar asistencia.';
          },
          error: () => Swal.fire('Error', 'No se pudo registrar', 'error')
        });
      } else {
        this.bioService.marcarAsistencia(embedding as number[], accion).subscribe({
          next: (res: any) => Swal.fire({ icon: 'success', title: 'Correcto', text: res.message }),
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Acceso Denegado', text: err.error?.message || 'Rostro no coincide' })
        });
      }
    } else {
      Swal.fire({ icon: 'warning', title: 'No detectado', text: 'No se detectó ningún rostro. Acércate más a la cámara.' });
      this.statusMessage = 'Intente nuevamente.';
    }
  }
}