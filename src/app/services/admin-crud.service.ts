import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCrudService {
  private apiUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) { }

  // Usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, { withCredentials: true });
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`, { withCredentials: true });
  }

  // Áreas
  getAreas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/areas`, { withCredentials: true });
  }

  saveArea(area: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/areas`, area, { withCredentials: true });
  }

  deleteArea(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/areas/${id}`, { withCredentials: true });
  }

  // Empleados
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleados`, { withCredentials: true });
  }
}