import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { I18nService } from './core/services/i18n.service';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './features/auth/data-access/auth.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      inject(AuthService).restoreSession();
      inject(I18nService).initializeLanguage();
      inject(ThemeService).initializeTheme();
    }),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
