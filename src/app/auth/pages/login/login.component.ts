import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http'; 

// Importamos el servicio y las interfaces
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/login-request.interface'; // Asegúrate de que esta ruta sea correcta en tu proyecto
import { LoginResponse } from '../../interfaces/login-response.interface'; // Asegúrate de que esta ruta sea correcta en tu proyecto

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordFieldType: string = 'password';
  errorMessage: string | null = null;
  logoutMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    // Inicializamos el formulario
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Revisamos si hay mensajes extra (ej. al cerrar sesión)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { errorMessage?: string, logoutMessage?: string };

    if (state) {
      if (state.errorMessage) this.errorMessage = state.errorMessage;
      if (state.logoutMessage) this.logoutMessage = state.logoutMessage;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.logoutMessage = null;

    if (this.loginForm.valid) {
      this.isLoading = true; // Activar estado de carga
      const credentials: LoginRequest = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response: LoginResponse) => {
          this.isLoading = false; // Desactivar carga
          console.log('Inicio de sesión exitoso:', response);
          
          // --- CORRECCIÓN DE RUTA (SIN TOCAR BACKEND) ---
          let urlDestino = response.redirectUrl;

          // Si el backend nos manda a la ruta vieja "/admin-dashboard",
          // nosotros lo corregimos aquí mismo a "/admin"
          if (response.role === 'ADMIN') {
    urlDestino = '/admin/home'; // <--- CAMBIO AQUÍ: Añadir /home
} 
else if (response.role === 'EMPLEADO') {
    urlDestino = '/empleado-dashboard'; 
}

          // Navegamos a la URL correcta
          this.router.navigate([urlDestino]); 
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Error de inicio de sesión:', err);
          
          this.errorMessage = err.error?.message || 'Error de inicio de sesión. Credenciales incorrectas.';
          this.cdr.detectChanges(); // Forzar actualización de la vista para mostrar el error
        }
      });
    } else {
      // Si el formulario es inválido, marcamos los campos para mostrar errores rojos
      this.loginForm.markAllAsTouched();
    }
  }
}