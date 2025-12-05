import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/login-request.interface';
import { LoginResponse } from '../../interfaces/login-response.interface'; // Importar LoginResponse
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Asegúrate de importar HttpClientModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], // HttpClientModule debe importarse aquí también para standalone
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordFieldType: string = 'password';
  errorMessage: string | null = null;
  logoutMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Check for messages in query params (e.g., after logout or failed login redirect)
    // This part is illustrative and might need adaptation based on actual app flow
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { errorMessage?: string, logoutMessage?: string };

    if (state) {
      if (state.errorMessage) {
        this.errorMessage = state.errorMessage;
      }
      if (state.logoutMessage) {
        this.logoutMessage = state.logoutMessage;
      }
    }
  }

  /**
   * Alterna la visibilidad de la contraseña en el campo de entrada.
   */
  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * Llama al servicio de autenticación y maneja la respuesta o los errores.
   */
  onSubmit(): void {
    this.errorMessage = null; // Clear previous errors
    this.logoutMessage = null; // Clear previous logout messages

    if (this.loginForm.valid) {
      const credentials: LoginRequest = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response: LoginResponse) => {
          // Asumimos que el backend devuelve un token y quizás otros datos de usuario.
          // Aquí deberías guardar el token (ej. en localStorage) y redirigir al usuario.
          console.log('Inicio de sesión exitoso:', response);
          localStorage.setItem('authToken', response.token);
          // Redirección basada en roles
          if (response.role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else if (response.role === 'empleado') {
            this.router.navigate(['/empleado-dashboard']);
          } else {
            this.router.navigate(['/dashboard']); // Redirige a la página principal o dashboard por defecto
          }
        },
        error: (err) => {
          console.error('Error de inicio de sesión:', err);
          // Puedes adaptar el mensaje de error según la respuesta del backend
          this.errorMessage = 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
        }
      });
    } else {
      // Marcar todos los campos como "touched" para mostrar los errores de validación
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa correctamente todos los campos.';
    }
  }
}
