import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private userKey = 'grupoUnionUser';

  constructor(private http: HttpClient, private router: Router) { }

  // --- MÉTODOS DEL LOGIN SEGURO (CORREO/TOKEN) ---

  loginStep1(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-step1`, credentials);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  verify2FA(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-2fa`, data, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          if (response.status === 'success') {
            localStorage.setItem(this.userKey, JSON.stringify(response));
          }
        })
      );
  }

  // --- MÉTODOS DE UTILIDAD (ESTOS FALTABAN Y CAUSABAN EL ERROR) ---

  logout(): void {
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.userKey);
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