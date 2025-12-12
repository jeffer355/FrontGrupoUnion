import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    
    // 1. Clonar la petición original
    let clonedRequest = req;

    // 2. Comprobamos la URL para evitar problemas de CORS o envío innecesario a otros APIs
    const backendUrl = 'https://grupounion-backend.onrender.com';
    
    if (req.url.startsWith(backendUrl)) {
        
        // 3. Clonar la petición y añadir la opción withCredentials: true.
        // Esto le indica al navegador que debe adjuntar la cookie JSESSIONID.
        // Nota: No es necesario verificar si ya existe, la clonación es segura.
        clonedRequest = req.clone({
            withCredentials: true
        });
    }

    // 4. Continuar con la petición modificada (o la original si no es al backend)
    return next(clonedRequest);
};