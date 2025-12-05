import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent, // Import the standalone component directly
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.controls['username']).toBeDefined();
    expect(component.loginForm.controls['password']).toBeDefined();
  });

  it('should toggle password visibility', () => {
    expect(component.passwordFieldType).toBe('password');
    component.togglePasswordVisibility();
    expect(component.passwordFieldType).toBe('text');
    component.togglePasswordVisibility();
    expect(component.passwordFieldType).toBe('password');
  });

  it('should call authService.login on valid form submission', () => {
    const loginSpy = spyOn(authService, 'login').and.returnValue(of({ token: 'test-token' }));
    const navigateSpy = spyOn(component['router'], 'navigate');

    component.loginForm.controls['username'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('password123');

    component.onSubmit();

    expect(loginSpy).toHaveBeenCalledWith({ username: 'test@example.com', password: 'password123' });
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(localStorage.getItem('authToken')).toBe('test-token');
  });

  it('should not call authService.login on invalid form submission', () => {
    const loginSpy = spyOn(authService, 'login');

    component.loginForm.controls['username'].setValue('invalid-email');
    component.loginForm.controls['password'].setValue('');

    component.onSubmit();

    expect(loginSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Por favor, completa correctamente todos los campos.');
  });
});
