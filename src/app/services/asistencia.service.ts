import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = 'https://grupounion-backend.onrender.com/api/asistencia-manual';

  constructor(private http: HttpClient) {}

  // --- EMPLEADO ---
  obtenerHoy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hoy`, { withCredentials: true });
  }

  // MÉTODO ACTUALIZADO: Recibe 'observacion'
  marcar(tipo: 'ENTRADA' | 'SALIDA', confirmado: boolean = false, observacion: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcar`, { tipo, confirmado, observacion }, { withCredentials: true });
  }

  getMisRegistros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-registros`, { withCredentials: true });
  }

  // --- ADMIN ---
  getReporteDiario(fecha?: string): Observable<any[]> {
    const url = fecha ? `${this.apiUrl}/reporte-diario?fecha=${fecha}` : `${this.apiUrl}/reporte-diario`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  getHistorialEmpleado(idEmpleado: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial/${idEmpleado}`, { withCredentials: true });
  }

  updateAsistencia(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, data, { withCredentials: true });
  }
}