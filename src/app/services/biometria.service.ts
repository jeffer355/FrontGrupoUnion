import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BiometriaService {
  private apiUrl = 'https://grupounion-backend.onrender.com/api/biometria';

  constructor(private http: HttpClient) {}

  checkEstado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estado`, { withCredentials: true });
  }

  registrarRostro(embedding: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, { embedding }, { withCredentials: true });
  }

  marcarAsistencia(embedding: number[], tipo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validar`, { embedding, tipo }, { withCredentials: true });
  }
}