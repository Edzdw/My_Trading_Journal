import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher.component';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-protected-page',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LanguageSwitcherComponent],
  template: `
    <section class="min-h-dvh bg-transparent px-4 py-6 md:px-6">
      <div class="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/30">
        <header class="border-b border-slate-200/80 bg-white/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700 dark:text-blue-300">{{ i18n.t('common.appName') }}</p>
              <div class="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 class="text-2xl font-semibold text-slate-950 dark:text-slate-100">{{ i18n.t('auth.protected.title') }}</h1>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ i18n.t('auth.protected.subtitle') }}</p>
                </div>
                <nav class="flex flex-wrap gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <a
                    routerLink="/app/trades"
                    routerLinkActive="bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                    [routerLinkActiveOptions]="{ exact: true }"
                    class="rounded-full px-4 py-2 transition hover:text-slate-900 dark:hover:text-slate-100">
                    {{ i18n.t('auth.protected.nav.trades') }}
                  </a>
                  <a
                    routerLink="/app/trades/new"
                    routerLinkActive="bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                    class="rounded-full px-4 py-2 transition hover:text-slate-900 dark:hover:text-slate-100">
                    {{ i18n.t('auth.protected.nav.newTrade') }}
                  </a>
                  <a
                    routerLink="/app/trades/import"
                    routerLinkActive="bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                    class="rounded-full px-4 py-2 transition hover:text-slate-900 dark:hover:text-slate-100">
                    {{ i18n.t('auth.protected.nav.importTrades') }}
                  </a>
                </nav>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <app-language-switcher />

              <button
                type="button"
                class="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                (click)="themeService.toggleTheme()">
                {{ themeService.isDarkMode() ? i18n.t('common.themes.lightMode') : i18n.t('common.themes.darkMode') }}
              </button>

              <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                  {{ authService.currentUserInitial() }}
                </div>

                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{{ i18n.t('auth.protected.signedInAs') }}</p>
                  <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {{ authService.currentUserEmail() ?? i18n.t('auth.protected.currentUser') }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-slate-700"
                [disabled]="isSubmitting()"
                (click)="logout()">
                {{ isSubmitting() ? i18n.t('auth.protected.logoutSubmitting') : i18n.t('common.actions.logout') }}
              </button>
            </div>
          </div>

          @if (submitError()) {
            <div class="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
              {{ submitError() }}
            </div>
          }
        </header>

        <main class="flex-1 px-6 py-6">
          <router-outlet />
        </main>
      </div>
    </section>
  `
})
export class ProtectedPageComponent {
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly themeService = inject(ThemeService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  constructor() {
    this.authService
      .loadCurrentUserProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected logout(): void {
    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitError.set(error?.error?.message ?? this.i18n.t('auth.protected.logoutError'));
        }
      });
  }
}
