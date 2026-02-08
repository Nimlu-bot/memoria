import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideHttpClient } from '@angular/common/http';

import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
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
  ],
};
