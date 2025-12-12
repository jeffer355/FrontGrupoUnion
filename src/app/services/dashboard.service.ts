import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8081/api';

  private adminPhotoSource = new BehaviorSubject<string | null>(null);
  currentAdminPhoto$ = this.adminPhotoSource.asObservable();

  constructor(private http: HttpClient) { }

  getAdminData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-data`, { withCredentials: true })
      .pipe(
        tap(data => {
            if(data && data.fotoUrl) {
                this.updatePhoto(data.fotoUrl);
            }
        })
      );
  }

  getEmpleadoData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empleado/dashboard-data`, { withCredentials: true });
  }

  updatePhoto(newUrl: string) {
    this.adminPhotoSource.next(newUrl);
  }

  // --- ESTOS SON LOS MÉTODOS QUE FALTABAN ---
  
  getBirthdayWidget(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/widgets/birthdays`, { withCredentials: true });
  }

  getChartWidget(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/widgets/chart-areas`, { withCredentials: true });
  }

  // --- WIDGETS EMPLEADO ---
  getEmployeeBirthdaysWidget(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleado/widgets/birthdays`, { withCredentials: true });
  }

  getPoliciesWidget(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleado/widgets/policies`, { withCredentials: true });
  }
}