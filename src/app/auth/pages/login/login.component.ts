import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  changePassForm: FormGroup;
  tokenForm: FormGroup;

  step: 'LOGIN' | 'CHANGE_PASS' | 'TOKEN' = 'LOGIN';
  isLoading = false;
  tempUsername = '';
  
  // Variables para compatibilidad HTML
  passwordFieldType: string = 'password';
  logoutMessage: string | null = null; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.changePassForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.tokenForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { logoutMessage?: string };
    if (state && state.logoutMessage) {
      this.logoutMessage = state.logoutMessage;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  // --- PASO 1: LOGIN ---
  onSubmitLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    
    this.authService.loginStep1(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.tempUsername = this.loginForm.get('username')?.value;

        if (res.status === 'CHANGE_PASSWORD_REQUIRED') {
          // Si requiere cambio, mostramos alerta y AL CERRAR cambiamos la vista
          Swal.fire({
            title: 'Primer Ingreso',
            text: 'Por seguridad, debes cambiar tu contraseña.',
            icon: 'info',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.step = 'CHANGE_PASS';
            this.cdr.detectChanges(); // FORZAR ACTUALIZACIÓN
          });

        } else {
          // Si es login normal
          this.step = 'TOKEN';
          Swal.fire({
            title: 'Código Enviado',
            text: 'Revisa tu correo electrónico.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Credenciales incorrectas', 'error');
      }
    });
  }

  // --- PASO 2: CAMBIAR CLAVE (CORREGIDO) ---
  onSubmitChangePass() {
    if (this.changePassForm.invalid || this.changePassForm.value.newPassword !== this.changePassForm.value.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'warning'); return;
    }
    
    this.isLoading = true;
    
    this.authService.changePassword({
      username: this.tempUsername,
      newPassword: this.changePassForm.value.newPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        
        // MOSTRAR ALERTA DE ÉXITO
        Swal.fire({
            title: '¡Contraseña Actualizada!',
            text: 'Hemos enviado un código de acceso a tu correo.',
            icon: 'success',
            confirmButtonText: 'Ingresar Código',
            confirmButtonColor: '#10b981' // Verde
        }).then(() => {
            // ESTO SE EJECUTA AL DAR CLICK EN "OK"
            console.log("Cambiando vista a TOKEN...");
            this.step = 'TOKEN'; 
            this.cdr.detectChanges(); // ¡ESTO ES LO QUE ARREGLA EL PROBLEMA!
        });
      },
      error: () => { 
        this.isLoading = false;
        Swal.fire('Error', 'No se pudo actualizar', 'error'); 
      }
    });
  }

  // --- PASO 3: TOKEN ---
  onSubmitToken() {
    if (this.tokenForm.invalid) return;
    this.isLoading = true;

    this.authService.verify2FA({
      username: this.tempUsername,
      token: this.tokenForm.value.token
    }).subscribe({
      next: (res: any) => {
        let url = res.redirectUrl;
        // Corrección de ruta
        if(res.role === 'ADMIN') url = '/admin/home';
        
        Swal.fire({ 
            icon: 'success', 
            title: '¡Bienvenido!', 
            timer: 1500, 
            showConfirmButton: false 
        }).then(() => {
            this.router.navigate([url]);
        });
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Código incorrecto', 'error');
      }
    });
  }

  onSubmit() {
    if (this.step === 'LOGIN') this.onSubmitLogin();
    else if (this.step === 'CHANGE_PASS') this.onSubmitChangePass();
    else if (this.step === 'TOKEN') this.onSubmitToken();
  }
}