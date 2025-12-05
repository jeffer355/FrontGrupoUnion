import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'YOUR_BACKEND_LOGIN_URL'; // Placeholder: ¡Asegúrate de reemplazar esta URL!

  constructor(private http: HttpClient) { }

  /**
   * Envía las credenciales de inicio de sesión al backend.
   * @param credentials Objeto LoginRequest con username y password.
   * @returns Observable que emite la respuesta del servidor (LoginResponse).
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Aquí puedes realizar la llamada HTTP real a tu backend
    // Por ejemplo:
    // return this.http.post<LoginResponse>(this.apiUrl, credentials);

    // Placeholder: Simula una respuesta exitosa después de un pequeño retraso
    // Elimina esto cuando integres tu backend real.
    console.log('Simulando inicio de sesión con:', credentials);
    let userRole: string;
    if (credentials.username.includes('admin')) {
      userRole = 'admin';
    } else if (credentials.username.includes('empleado')) {
      userRole = 'empleado';
    } else {
      userRole = 'empleado'; // Rol por defecto
    }

    return of({ token: 'mock-jwt-token-12345', role: userRole });
  }

  // Otros métodos de autenticación (logout, isLogged, etc.) podrían ir aquí.
}
