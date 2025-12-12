import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { 
    provideHttpClient, 
    withInterceptors // <-- MIGRACIÓN A SINTAXIS MODERNA
} from '@angular/common/http';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// --- IMPORTACIÓN CRÍTICA DEL NUEVO INTERCEPTOR ---
import { credentialsInterceptor } from './auth/interceptors/credentials.interceptor'; 
// -------------------------------------------------

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        
        // 1. CONFIGURACIÓN FINAL: Registramos el interceptor con withInterceptors()
        provideHttpClient(withInterceptors([
            credentialsInterceptor // Registramos la función interceptora aquí
        ])), 

        // 2. REGISTRAR LOS GRÁFICOS
        provideCharts(withDefaultRegisterables()) 
    ]
};