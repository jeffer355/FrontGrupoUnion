import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs'; // Importamos tap y BehaviorSubject

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8081/api';

  // --- LOGICA DE ACTUALIZACIÓN DE FOTO ---
  // 1. Creamos un Subject que guarda el estado de la foto actual
  private adminPhotoSource = new BehaviorSubject<string | null>(null);
  
  // 2. Exponemos un Observable para que el Sidebar se suscriba
  currentAdminPhoto$ = this.adminPhotoSource.asObservable();

  constructor(private http: HttpClient) { }

  // IMPORTANTE: { withCredentials: true } es obligatorio
  getAdminData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-data`, { withCredentials: true })
      .pipe(
        // 3. Cuando obtenemos datos, actualizamos el Subject si hay foto
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

  // 4. Método para forzar la actualización de la foto manualmente
  updatePhoto(newUrl: string) {
    this.adminPhotoSource.next(newUrl);
  }
}