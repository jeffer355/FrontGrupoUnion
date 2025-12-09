import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GestionCorporativaService {
  private apiUrl = 'http://localhost:8081/api/gestion';

  // Canal de comunicación para avisar cambios
  private _refreshNeeded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Método para que los componentes se suscriban
  get refreshNeeded$() {
    return this._refreshNeeded$;
  }

  // --- BOLETAS ---
  getMisBoletas(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/boletas/mis-boletas`, { withCredentials: true }); 
  }
  
  // MODIFICADO: Avisa al terminar de subir
  uploadBoleta(formData: FormData): Observable<any> { 
    return this.http.post(`${this.apiUrl}/admin/boletas/upload`, formData, { withCredentials: true })
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      ); 
  }
  
  getHistorialBoletasAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/boletas/historial`, { withCredentials: true });
  }

  // --- DOCUMENTOS ---
  getMisDocumentos(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/documentos/mis-documentos`, { withCredentials: true }); 
  }
  
  // MODIFICADO: Avisa al terminar de subir
  uploadDocumento(formData: FormData): Observable<any> { 
    return this.http.post(`${this.apiUrl}/admin/documentos/upload`, formData, { withCredentials: true })
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      ); 
  }
  
  getHistorialDocumentosAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/documentos/historial`, { withCredentials: true });
  }

  // --- SOLICITUDES ---
  getMisSolicitudes(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes/mis-solicitudes`, { withCredentials: true }); 
  }
  
  getAllSolicitudesAdmin(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/admin/solicitudes`, { withCredentials: true }); 
  }
  
  // MODIFICADO: Avisa al terminar de crear
  crearSolicitud(formData: FormData): Observable<any> { 
    return this.http.post(`${this.apiUrl}/solicitudes/crear`, formData, { withCredentials: true })
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      ); 
  }
}