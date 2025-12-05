import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/login-request.interface';
import { LoginResponse } from '../../interfaces/login-response.interface'; // Importar LoginResponse
import { Router } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http'; // Asegúrate de importar HttpClientModule

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
  isLoading: boolean = false; // Add loading state

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Injected ChangeDetectorRef
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
      this.isLoading = true; // Set loading to true
      const credentials: LoginRequest = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response: LoginResponse) => {
          this.isLoading = false; // Set loading to false on success
          console.log('Inicio de sesión exitoso:', response);
          this.router.navigate([response.redirectUrl]); // Redirección basada en la URL proporcionada por el backend
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false; // Set loading to false on error
          console.error('Error de inicio de sesión:', err);
          // Usar el mensaje de error del backend si está disponible, de lo contrario, un mensaje genérico.
          this.errorMessage = err.error?.message || 'Error de inicio de sesión. Por favor, inténtalo de nuevo.';
          console.log('Mensaje de error asignado:', this.errorMessage);
          this.cdr.detectChanges(); // Force change detection
        }
      });
    } else {
      // Marcar todos los campos como "touched" para mostrar los errores de validación
      this.loginForm.markAllAsTouched();
      // Ya no se establece un errorMessage genérico aquí, se confía en los mensajes específicos de los campos.
    }
  }
}
