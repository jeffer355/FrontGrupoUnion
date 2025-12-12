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
  //               UTILIDADES
  // ==========================================
  getTiposDocumento(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-documento`);
  }

  // --- NUEVO: OBTENER CARGOS ---
  getCargos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cargos`);
  }

  uploadFotoPersona(idPersona: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/personas/${idPersona}/foto`, formData);
  }

  // ==========================================
  //               USUARIOS
  // ==========================================
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }
  createUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }
  updateUsuario(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios`, usuario);
  }
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // ==========================================
  //                 ÁREAS
  // ==========================================
  getAreas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/areas`);
  }
  getEmpleadosPorArea(idArea: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/areas/${idArea}/empleados`);
  }
  saveArea(area: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/areas`, area);
  }
  updateArea(id: number, area: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/areas/${id}`, area);
  }
  deleteArea(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/areas/${id}`);
  }

  // ==========================================
  //               EMPLEADOS
  // ==========================================
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleados`);
  }
  createEmpleado(empleado: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/empleados`, empleado);
  }
  updateEmpleado(empleado: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/empleados`, empleado);
  }
  deleteEmpleado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/empleados/${id}`);
  }

  // ==========================================
  //           CONTRATOS 
  // ==========================================
  getContratos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contratos`);
  }

  crearContrato(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contratos`, data);
  }

  // ==========================================
  //       BOLETAS & PLANILLAS 
  // ==========================================
  
  previsualizarBoleta(data: {idEmpleado: number, mes: number, anio: number}): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/boletas/previsualizar`, data, { 
      responseType: 'blob' 
    });
  }

  guardarBoletaGenerada(data: {idEmpleado: number, mes: number, anio: number, usuario: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/boletas/guardar-generada`, data);
  }

  generarPlanilla(mes: number, anio: number, usuario: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/planillas/generar`, { mes, anio, usuario });
  }
}