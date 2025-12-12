import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCrudService {
  private apiUrl = 'https://grupounion-backend.onrender.com/api/admin';

  constructor(private http: HttpClient) { }

  // ==========================================
  //               UTILIDADES
  // ==========================================
  getTiposDocumento(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-documento`, { withCredentials: true });
  }

  // --- NUEVO: OBTENER CARGOS ---
  getCargos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cargos`, { withCredentials: true });
  }

  uploadFotoPersona(idPersona: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/personas/${idPersona}/foto`, formData, { withCredentials: true });
  }

  // ==========================================
  //               USUARIOS
  // ==========================================
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, { withCredentials: true });
  }
  createUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario, { withCredentials: true });
  }
  updateUsuario(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios`, usuario, { withCredentials: true });
  }
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`, { withCredentials: true });
  }

  // ==========================================
  //                 ÁREAS
  // ==========================================
  getAreas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/areas`, { withCredentials: true });
  }
  getEmpleadosPorArea(idArea: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/areas/${idArea}/empleados`, { withCredentials: true });
  }
  saveArea(area: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/areas`, area, { withCredentials: true });
  }
  updateArea(id: number, area: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/areas/${id}`, area, { withCredentials: true });
  }
  deleteArea(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/areas/${id}`, { withCredentials: true });
  }

  // ==========================================
  //               EMPLEADOS
  // ==========================================
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleados`, { withCredentials: true });
  }
  createEmpleado(empleado: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/empleados`, empleado, { withCredentials: true });
  }
  updateEmpleado(empleado: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/empleados`, empleado, { withCredentials: true });
  }
  deleteEmpleado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/empleados/${id}`, { withCredentials: true });
  }

  // ==========================================
  //           CONTRATOS 
  // ==========================================
  getContratos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contratos`, { withCredentials: true });
  }

  crearContrato(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contratos`, data, { withCredentials: true });
  }

  // ==========================================
  //       BOLETAS & PLANILLAS 
  // ==========================================
  
  previsualizarBoleta(data: {idEmpleado: number, mes: number, anio: number}): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/boletas/previsualizar`, data, { 
      withCredentials: true,
      responseType: 'blob' 
    });
  }

  guardarBoletaGenerada(data: {idEmpleado: number, mes: number, anio: number, usuario: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/boletas/guardar-generada`, data, { withCredentials: true });
  }

  generarPlanilla(mes: number, anio: number, usuario: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/planillas/generar`, { mes, anio, usuario }, { withCredentials: true });
  }
}