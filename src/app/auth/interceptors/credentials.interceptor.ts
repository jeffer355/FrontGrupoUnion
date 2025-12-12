import { HttpInterceptorFn } from '@angular/common/http';

// Esta función intercepta todas las peticiones y les añade la opción 
// de enviar credenciales (cookies) si la URL coincide con la de tu backend.
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    
    // URL de tu backend de Render
    const backendUrl = 'https://grupounion-backend.onrender.com';
    
    if (req.url.startsWith(backendUrl)) {
        
        // Clonamos la petición para añadir withCredentials: true.
        // Esto fuerza al navegador a adjuntar la cookie JSESSIONID.
        const clonedRequest = req.clone({
            withCredentials: true
        });
        
        // Continuamos la cadena de intercepción con la petición modificada
        return next(clonedRequest);
    }
    
    // Si no es tu backend, pasamos la petición sin modificar
    return next(req);
};