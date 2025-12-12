import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// --- 1. IMPORTACIONES OBLIGATORIAS PARA GRÁFICOS ---
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    // --- 2. REGISTRAR LOS GRÁFICOS AQUÍ ---
    provideCharts(withDefaultRegisterables()) 
  ]
};