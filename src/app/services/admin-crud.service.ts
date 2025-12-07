import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCrudService {
  private apiUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) { }

  // --- CATALOGOS ---
  getTiposDocumento(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-documento`, { withCredentials: true });
  }

  // --- USUARIOS ---
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

  // --- ÁREAS ---
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

  // --- EMPLEADOS ---
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
}