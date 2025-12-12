import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Asegúrate que esta ruta sea correcta

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    
    // Inyectamos el servicio para obtener el token
    const authService = inject(AuthService); 
    const token = authService.getToken(); // Obtiene el token JWT
    
    // URL de tu backend de Render
    const backendUrl = 'https://grupounion-backend.onrender.com';
    
    // Si tenemos un token Y la petición va a nuestro backend
    if (token && req.url.startsWith(backendUrl)) {
        
        // Clonamos para añadir el encabezado Authorization: Bearer
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}` // 👈 CLAVE: Envía el token JWT
            },
            // CRÍTICO: Aseguramos que NO se envíen cookies de sesión
            withCredentials: false 
        });
        
        return next(clonedRequest);
    }
    
    // Si no hay token o no es nuestra API, pasamos la petición original
    return next(req);
};