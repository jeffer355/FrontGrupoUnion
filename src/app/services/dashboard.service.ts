import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) { }

  // IMPORTANTE: { withCredentials: true } es obligatorio
  getAdminData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-data`, { withCredentials: true });
  }

  getEmpleadoData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empleado/dashboard-data`, { withCredentials: true });
  }
}