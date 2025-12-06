import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si está logueado
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // 2. Verificar Roles (si la ruta exige uno específico)
  const expectedRole = route.data['role'];
  const userRole = authService.getUserRole();

  if (expectedRole && expectedRole !== userRole) {
    // Si intenta entrar a Admin siendo Empleado, o viceversa:
    if (userRole === 'ADMIN') {
      router.navigate(['/admin-dashboard']);
    } else if (userRole === 'EMPLEADO') {
      router.navigate(['/empleado-dashboard']);
    } else {
      router.navigate(['/auth/login']);
    }
    return false;
  }

  return true;
};