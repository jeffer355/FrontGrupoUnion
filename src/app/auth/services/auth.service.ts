import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://grupounion-backend.onrender.com/api/auth';
  private tokenKey = 'jwt_token'; // 👈 CLAVE JWT
  private userKey = 'grupoUnionUser';

  constructor(private http: HttpClient, private router: Router) { }

  // --- MÉTODOS DEL LOGIN SEGURO (CORREO/TOKEN) ---

  loginStep1(credentials: any): Observable<any> {
    // Ya no necesita withCredentials
    return this.http.post(`${this.apiUrl}/login-step1`, credentials);
  }

  changePassword(data: any): Observable<any> {
    // Ya no necesita withCredentials
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  verify2FA(data: any): Observable<any> {
    // Se elimina { withCredentials: true }
    return this.http.post(`${this.apiUrl}/verify-2fa`, data) 
      .pipe(
        tap((response: any) => {
          // Asumimos que la respuesta del backend ahora tiene response.token
          if (response.status === 'success' && response.token) {
            localStorage.setItem(this.tokenKey, response.token); // 👈 Guarda el token JWT
            localStorage.setItem(this.userKey, JSON.stringify(response));
          }
        })
      );
  }

  // --- MÉTODOS DE UTILIDAD JWT ---

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey); // 👈 Obtiene JWT
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey); // 👈 Elimina JWT
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/auth/login'], { state: { logoutMessage: 'Sesión finalizada.' } });
  }

  isLoggedIn(): boolean {
    // Se considera logueado si existe el token JWT
    return !!this.getToken(); 
  }

  getUserRole(): string | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return null;
  }

  getUserName(): string | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.username;
    }
    return null;
  }
}