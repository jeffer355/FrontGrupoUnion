import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { 
    provideHttpClient, 
    withInterceptorsFromDi, // Permite inyectar interceptores heredados
    HTTP_INTERCEPTORS       // El token de inyección
} from '@angular/common/http';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// --- NUEVAS IMPORTACIONES CRÍTICAS ---
// Importa tu interceptor para registrarlo
import { JwtInterceptor } from './auth/interceptors/jwt.interceptor'; 
// ------------------------------------

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        
        // 1. Configuración de HttpClient con soporte para Interceptores de DI
        // Esto reemplaza tu `provideHttpClient()` básico
        provideHttpClient(withInterceptorsFromDi()), 

        // 2. REGISTRO GLOBAL DEL INTERCEPTOR DE CREDENCIALES
        // Esto asegura que la lógica del interceptor se ejecute en todas las peticiones,
        // incluyendo la inyección de las credenciales si es necesario.
        { 
            provide: HTTP_INTERCEPTORS, 
            useClass: JwtInterceptor, 
            multi: true 
        },

        // --- 3. REGISTRAR LOS GRÁFICOS AQUÍ ---
        provideCharts(withDefaultRegisterables()) 
    ]
};