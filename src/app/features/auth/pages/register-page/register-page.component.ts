import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../../core/services/i18n.service';
import { AuthShellComponent } from '../../components/auth-shell.component';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {
  protected readonly i18n = inject(I18nService);

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
          this.submitError.set(error?.error?.message ?? this.i18n.t('auth.register.fallbackError'));
        }
      });
  }
}
