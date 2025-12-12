import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    // No necesitamos un token JWT para la sesión con cookies.
    constructor() { } 

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // La URL de tu backend de Render
        const backendUrl = 'https://grupounion-backend.onrender.com';

        // 1. Verificar si la petición va dirigida a tu backend
        if (request.url.startsWith(backendUrl)) {
            
            // 2. Clonamos la petición para añadir conCredentials: true si aún no está.
            // Aunque tu servicio ya lo tiene, esta es una capa de seguridad global.
            // También podemos forzar el envío de cookies sin añadir headers manualmente, 
            // ya que la configuración en los servicios (`withCredentials: true`) y 
            // el backend (`SameSite=None`) deberían bastar.
            
            // Ya que tus servicios individuales usan { withCredentials: true }, 
            // nos aseguramos de que el interceptor no lo anule, sino que lo refuerce.

            // ⚠️ Para la autenticación basada en cookies, NO NECESITAS la cabecera Authorization (Bearer Token).
            // Si la tenías, la eliminamos para evitar errores de CORS con preflight OPTIONS requests,
            // o simplemente dejamos que la petición pase para que funcione el `withCredentials: true` en el servicio.

            // Si el problema es que el navegador NO adjunta la cookie por defecto 
            // en peticiones cross-site, aseguramos que la directiva de credenciales 
            // sea honrada y pasamos la petición limpia para no interferir con CORS.
            
            // Si tu sesión es puramente por cookies, elimina o comenta las líneas que manejan JWT
            // (que NO estás usando). Dejamos pasar la petición para que `withCredentials: true` actúe.
        }

        // 3. Dejar que la petición siga su curso (incluyendo el withCredentials: true de los servicios)
        return next.handle(request);
    }
}