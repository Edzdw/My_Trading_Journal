import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { AuthShellComponent } from '../components/auth-shell.component';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  template: `
    <app-auth-shell activeView="login">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-semibold text-slate-950 dark:text-slate-100">{{ i18n.t('auth.login.title') }}</h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ i18n.t('auth.login.subtitle') }}</p>
        </div>

        @if (submitError()) {
          <div class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
            {{ submitError() }}
          </div>
        }

        <form class="space-y-4" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ i18n.t('auth.login.email') }}</span>
            <input
              type="email"
              formControlName="email"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              placeholder="trader@example.com" />
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ i18n.t('auth.login.password') }}</span>
            <input
              type="password"
              formControlName="password"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              [placeholder]="i18n.t('auth.login.passwordPlaceholder')" />
          </label>

          <button
            type="submit"
            class="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            [disabled]="isSubmitting()">
            {{ isSubmitting() ? i18n.t('auth.login.submitting') : i18n.t('auth.login.submit') }}
          </button>
        </form>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
          {{ i18n.t('auth.login.noAccount') }}
          <a routerLink="/register" class="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">{{ i18n.t('auth.login.createOne') }}</a>.
        </div>

        @if (authService.isAuthenticated()) {
          <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
            {{ i18n.t('auth.login.existingSession') }}
            <button type="button" class="ml-1 font-semibold underline" (click)="goToApp()">
              {{ i18n.t('common.actions.openProtectedPage') }}
            </button>
          </div>
        }
      </div>
    </app-auth-shell>
  `
})
export class LoginPageComponent {
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/app']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitError.set(error?.error?.message ?? this.i18n.t('auth.login.fallbackError'));
        }
      });
  }

  protected goToApp(): void {
    void this.router.navigate(['/app']);
  }
}
