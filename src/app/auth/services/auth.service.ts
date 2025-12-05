import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) { }

  /**
   * Envía las credenciales de inicio de sesión al backend.
   * @param credentials Objeto LoginRequest con username y password.
   * @returns Observable que emite la respuesta del servidor (LoginResponse).
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Aquí puedes realizar la llamada HTTP real a tu backend
    // Por ejemplo:
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, credentials);
  }

  // Otros métodos de autenticación (logout, isLogged, etc.) podrían ir aquí.
}
