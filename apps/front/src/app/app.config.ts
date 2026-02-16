import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { credentialsInterceptor } from '@/shared/lib/';
import { SessionService } from '@/shared/api/session.service';
import { initializeCapacitor } from '@/shared/lib/';
import { NotificationService } from '@/features/notifications/notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),

    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
    // Initialize Capacitor plugins on app startup
    provideAppInitializer(() => initializeCapacitor()),
    // Initialize notifications service
    provideAppInitializer(() => {
      inject(NotificationService);
    }),
    // Initialize session service (which uses EnvironmentService)
    provideAppInitializer(() => inject(SessionService).initialize()),
  ],
};
