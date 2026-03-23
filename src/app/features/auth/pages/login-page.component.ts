import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthShellComponent } from '../components/auth-shell.component';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  template: `
    <app-auth-shell activeView="login">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-semibold text-slate-950">Welcome back</h2>
          <p class="mt-2 text-sm text-slate-500">Sign in to continue to the protected trade journal area.</p>
        </div>

        @if (submitError()) {
          <div class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ submitError() }}
          </div>
        }

        <form class="space-y-4" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              formControlName="email"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="trader@example.com" />
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              formControlName="password"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Enter your password" />
          </label>

          <button
            type="submit"
            class="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          No account yet?
          <a routerLink="/register" class="font-semibold text-blue-700 hover:text-blue-800">Create one here</a>.
        </div>

        @if (authService.isAuthenticated()) {
          <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-700">
            Existing session detected.
            <button type="button" class="ml-1 font-semibold underline" (click)="goToApp()">
              Open protected page
            </button>
          </div>
        }
      </div>
    </app-auth-shell>
  `
})
export class LoginPageComponent {
  protected readonly authService = inject(AuthService);

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
          this.submitError.set(error?.error?.message ?? 'Unable to sign in with the provided credentials.');
        }
      });
  }

  protected goToApp(): void {
    void this.router.navigate(['/app']);
  }
}
