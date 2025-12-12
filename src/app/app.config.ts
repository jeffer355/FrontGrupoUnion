import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { 
    provideHttpClient, 
    withInterceptors // <-- USAMOS LA SINTAXIS MODERNA
} from '@angular/common/http';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// --- IMPORTACIÓN DEL INTERCEPTOR FUNCIONAL ---
import { credentialsInterceptor } from './auth/interceptors/credentials.interceptor'; 
// ---------------------------------------------

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        
        // 1. CONFIGURACIÓN FINAL DE HTTP CON EL INTERCEPTOR FUNCIONAL
        // Esto garantiza que el envío de la cookie esté activo globalmente
        provideHttpClient(withInterceptors([
            credentialsInterceptor // Registramos la función interceptora aquí
        ])), 

        // 2. REGISTRAR LOS GRÁFICOS
        provideCharts(withDefaultRegisterables()) 
    ]
};