import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher.component';

@Component({
  selector: 'app-auth-shell',
  imports: [NgClass, RouterLink, LanguageSwitcherComponent],
  template: `
    <section class="flex min-h-dvh items-center justify-center px-4 py-10">
      <div class="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/30 md:grid-cols-[1.1fr_0.9fr]">
        <div class="flex flex-col justify-between bg-slate-950 px-8 py-10 text-slate-100 dark:bg-slate-950 md:px-10">
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">{{ i18n.t('common.appName') }}</p>

              <div class="flex flex-wrap items-center justify-end gap-2">
                <app-language-switcher />

                <button
                  type="button"
                  class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/15"
                  (click)="themeService.toggleTheme()">
                  {{ themeService.isDarkMode() ? i18n.t('common.themes.light') : i18n.t('common.themes.dark') }}
                </button>
              </div>
            </div>

            <h1 class="max-w-sm text-4xl font-semibold leading-tight">{{ i18n.t('auth.shell.headline') }}</h1>
            <p class="max-w-md text-sm leading-6 text-slate-300">
              {{ i18n.t('auth.shell.description') }}
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{{ i18n.t('auth.shell.currentFocusLabel') }}</p>
            <p class="mt-2 text-sm text-slate-200">
              {{ i18n.t('auth.shell.currentFocusDescription') }}
            </p>
          </div>
        </div>

        <div class="flex items-center px-6 py-8 dark:bg-slate-900/40 md:px-10">
          <div class="w-full">
            <div class="mb-8 flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <a
                routerLink="/login"
                class="flex-1 rounded-full px-4 py-2 text-center transition"
                [ngClass]="
                  activeView() === 'login'
                    ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'
                    : ''
                ">
                {{ i18n.t('auth.shell.tabs.login') }}
              </a>
              <a
                routerLink="/register"
                class="flex-1 rounded-full px-4 py-2 text-center transition"
                [ngClass]="
                  activeView() === 'register'
                    ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'
                    : ''
                ">
                {{ i18n.t('auth.shell.tabs.register') }}
              </a>
            </div>

            <ng-content />
          </div>
        </div>
      </div>
    </section>
  `
})
export class AuthShellComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly themeService = inject(ThemeService);
  readonly activeView = input.required<'login' | 'register'>();
}
