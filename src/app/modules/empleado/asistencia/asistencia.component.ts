import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiometriaService } from '../../../services/biometria.service';
import Swal from 'sweetalert2';

// Importamos face-api globalmente (asegúrate de haber hecho npm install)
declare var faceapi: any;

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bio-container fade-in">
      <h2><i class="fas fa-id-card-alt"></i> Control Biométrico</h2>
      
      <div class="scan-wrapper">
        <div class="video-container" [class.scanning]="isScanning">
          <video #videoElement autoplay muted></video>
          <canvas #canvasElement class="overlay"></canvas>
          <div class="scan-line" *ngIf="isScanning"></div>
        </div>
        
        <div class="status-panel">
          <p class="status-text">{{ statusMessage }}</p>
          
          <div *ngIf="!modelLoaded" class="loading-spinner">Cargando IA...</div>

          <div *ngIf="modelLoaded" class="actions">
            <button *ngIf="!isEnrolado" class="btn-primary" (click)="iniciarProceso('REGISTRO')">
              <i class="fas fa-user-plus"></i> Registrar mi Rostro (1ra vez)
            </button>

            <div *ngIf="isEnrolado" class="buttons-row">
              <button class="btn-success" (click)="iniciarProceso('ENTRADA')">
                <i class="fas fa-sign-in-alt"></i> Marcar Entrada
              </button>
              <button class="btn-danger" (click)="iniciarProceso('SALIDA')">
                <i class="fas fa-sign-out-alt"></i> Marcar Salida
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bio-container { padding: 20px; text-align: center; max-width: 800px; margin: 0 auto; }
    .scan-wrapper { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    
    .video-container { 
      position: relative; width: 100%; max-width: 640px; height: 480px; 
      margin: 0 auto; background: #000; border-radius: 10px; overflow: hidden;
    }
    video { width: 100%; height: 100%; object-fit: cover; }
    .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    
    /* Animación de scanner */
    .scan-line {
      position: absolute; width: 100%; height: 2px; background: #00ff00;
      top: 0; left: 0; box-shadow: 0 0 10px #00ff00;
      animation: scan 2s infinite linear;
    }
    @keyframes scan { 0% {top: 0;} 50% {top: 100%;} 100% {top: 0;} }

    .status-panel { margin-top: 20px; }
    .status-text { font-size: 1.2rem; font-weight: bold; color: #555; }
    
    .buttons-row { display: flex; gap: 20px; justify-content: center; margin-top: 15px; }
    button { padding: 12px 25px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; transition: transform 0.2s; }
    button:hover { transform: scale(1.05); }
    .btn-primary { background: #3969FC; }
    .btn-success { background: #10b981; }
    .btn-danger { background: #ef4444; }
  `]
})
export class AsistenciaComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoRef!: ElementRef;
  @ViewChild('canvasElement') canvasRef!: ElementRef;

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

  checkEstadoUsuario() {
    this.bioService.checkEstado().subscribe(res => {
      this.isEnrolado = res.enrolado;
      this.statusMessage = this.isEnrolado ? 'Listo para marcar asistencia.' : '⚠️ Rostro no registrado.';
    });
  }

  async loadModels() {
    // Asegúrate de que los modelos estén en src/assets/models
    const MODEL_URL = '/assets/models';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      this.modelLoaded = true;
      console.log('Modelos cargados');
    } catch (e) {
      console.error('Error cargando modelos', e);
      Swal.fire('Error', 'No se pudieron cargar los modelos de IA', 'error');
    }
  }

  startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        this.videoRef.nativeElement.srcObject = stream;
        this.stream = stream;
      })
      .catch(err => console.error(err));
  }

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
      // Tenemos el embedding (descriptor)
      const embedding = Array.from(detections.descriptor); // Convertir Float32Array a Array normal

      if (accion === 'REGISTRO') {
        this.bioService.registrarRostro(embedding as number[]).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Rostro registrado correctamente', 'success');
            this.isEnrolado = true;
            this.statusMessage = 'Rostro guardado.';
          },
          error: () => Swal.fire('Error', 'No se pudo registrar', 'error')
        });
      } else {
        this.bioService.marcarAsistencia(embedding as number[], accion).subscribe({
          next: (res) => Swal.fire('Bienvenido', res.message, 'success'),
          error: (err) => Swal.fire('Acceso Denegado', err.error.message || 'Rostro no coincide', 'error')
        });
      }
    } else {
      Swal.fire('Atención', 'No se detectó ningún rostro. Acércate más.', 'warning');
    }
  }
}