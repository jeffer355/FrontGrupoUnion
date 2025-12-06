import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Interfaces definidas aquí mismo para evitar errores de importación
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    status: string;
    message: string;
    role: string;
    redirectUrl: string;
    username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081'; 
  private userKey = 'grupoUnionUser';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, credentials, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.status === 'success') {
            localStorage.setItem(this.userKey, JSON.stringify(response));
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']) 
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.userKey);
  }

  getUserRole(): string | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user: LoginResponse = JSON.parse(userStr);
      return user.role;
    }
    return null;
  }

  // --- ESTA ES LA FUNCIÓN QUE FALTABA ---
  getUserName(): string | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user: LoginResponse = JSON.parse(userStr);
      return user.username;
    }
    return null;
  }
}