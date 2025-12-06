import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081';
  private userKey = 'grupoUnionUser'; // Clave para localStorage

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.status === 'success') {
            // Guardamos la info básica del usuario para que el Guard la lea
            localStorage.setItem(this.userKey, JSON.stringify(response));
          }
        })
      );
  }

  logout(): void {
    // 1. Limpiar localStorage
    localStorage.removeItem(this.userKey);
    
    // 2. Llamar al backend para matar la cookie JSESSIONID
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']) 
    });
  }

  // Verifica si hay un usuario guardado
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.userKey);
  }

  // Obtiene el rol del usuario actual ('ADMIN' o 'EMPLEADO')
  getUserRole(): string | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user: LoginResponse = JSON.parse(userStr);
      return user.role;
    }
    return null;
  }
}