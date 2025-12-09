import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GestionCorporativaService {
  private apiUrl = 'http://localhost:8081/api/gestion'; // Asegúrate que tu backend escuche aquí

  constructor(private http: HttpClient) {}

  // --- BOLETAS ---
  getMisBoletas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/boletas/mis-boletas`, { withCredentials: true });
  }
  uploadBoleta(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/boletas/upload`, formData, { withCredentials: true });
  }

  // --- DOCUMENTOS ---
  getMisDocumentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/documentos/mis-documentos`, { withCredentials: true });
  }
  uploadDocumento(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/documentos/upload`, formData, { withCredentials: true });
  }

  // --- SOLICITUDES ---
  getMisSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes/mis-solicitudes`, { withCredentials: true });
  }
  getAllSolicitudesAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/solicitudes`, { withCredentials: true });
  }
  crearSolicitud(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitudes/crear`, data, { withCredentials: true });
  }
}