import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    
    const backendUrl = 'https://grupounion-backend.onrender.com';
    
    // Si la petición va a nuestro backend
    if (req.url.startsWith(backendUrl)) {
        
        // Clonamos la petición para AÑADIR las credenciales
        const clonedRequest = req.clone({
            withCredentials: true
        });
        
        // Ejecutamos la petición clonada (con la cookie JSESSIONID adjunta)
        return next(clonedRequest);
    }
    
    // Para todas las demás peticiones, se pasan sin modificar
    return next(req);
};