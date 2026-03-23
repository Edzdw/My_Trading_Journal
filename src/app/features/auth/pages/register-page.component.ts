import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthShellComponent } from '../components/auth-shell.component';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  template: `
    <app-auth-shell activeView="register">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-semibold text-slate-950">Create your account</h2>
          <p class="mt-2 text-sm text-slate-500">Register once, store the issued tokens, and continue into the protected area.</p>
        </div>

        @if (submitError()) {
          <div class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ submitError() }}
          </div>
        }

        <form class="space-y-4" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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
              placeholder="Create a password" />
          </label>

          <button
            type="submit"
            class="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Already have an account?
          <a routerLink="/login" class="font-semibold text-blue-700 hover:text-blue-800">Sign in here</a>.
        </div>
      </div>
    </app-auth-shell>
  `
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.authService
      .register(this.registerForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/app']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitError.set(error?.error?.message ?? 'Unable to create your account right now.');
        }
      });
  }
}
