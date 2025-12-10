import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GestionCorporativaService {
  private apiUrl = 'http://localhost:8081/api/gestion';
  private _refreshNeeded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  get refreshNeeded$() { return this._refreshNeeded$; }

  // --- BOLETAS ---
  getMisBoletas(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/boletas/mis-boletas`, { withCredentials: true }); }
  getHistorialBoletasAdmin(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/admin/boletas/historial`, { withCredentials: true }); }
  uploadBoleta(formData: FormData): Observable<any> { 
    return this.http.post(`${this.apiUrl}/admin/boletas/upload`, formData, { withCredentials: true }).pipe(tap(() => { this._refreshNeeded$.next(); })); 
  }

  // --- DOCUMENTOS ---
  getMisDocumentos(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/documentos/mis-documentos`, { withCredentials: true }); }
  getHistorialDocumentosAdmin(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/admin/documentos/historial`, { withCredentials: true }); }
  
  // Subida Admin (Nuevo Documento)
  uploadDocumento(formData: FormData): Observable<any> { 
    return this.http.post(`${this.apiUrl}/admin/documentos/upload`, formData, { withCredentials: true }).pipe(tap(() => { this._refreshNeeded$.next(); })); 
  }

  // Subida Empleado (Nuevo Documento)
  uploadDocumentoEmpleado(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/empleado/documentos/upload`, formData, { withCredentials: true }).pipe(tap(() => { this._refreshNeeded$.next(); }));
  }

  // NUEVO: Reemplazar Archivo (Reenviar/Actualizar)
  replaceDocumento(id: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.put(`${this.apiUrl}/documentos/${id}/reemplazar`, fd, { withCredentials: true }).pipe(tap(() => { this._refreshNeeded$.next(); }));
  }

  // Actualizar Estado (Admin)
  updateEstadoDocumento(id: number, estado: string, observacion: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/documentos/${id}/estado`, { estado, observacion }, { withCredentials: true }).pipe(tap(() => { this._refreshNeeded$.next(); }));
  }

  // --- SOLICITUDES ---
  getMisSolicitudes(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/solicitudes/mis-solicitudes`, { withCredentials: true }); }
  getAllSolicitudesAdmin(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/admin/solicitudes`, { withCredentials: true }); }
  crearSolicitud(formData: FormData): Observable<any> { 
    return this.http.post(`${this.apiUrl}/solicitudes/crear`, formData, { withCredentials: true }).pipe(tap(() => { this._refreshNeeded$.next(); })); 
  }
}