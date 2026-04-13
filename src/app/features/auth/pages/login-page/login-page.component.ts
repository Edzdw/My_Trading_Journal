import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { ToastService } from '../../../../core/services/toast.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { AuthShellComponent } from '../../components/auth-shell.component';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  showToast = false;

  ngOnInit(): void {
  this.route.queryParamMap.subscribe((params) => {
    const reason = params.get('reason');

   if (reason === 'session-expired') {
  this.toastService.show('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'warning');
}
  });
}


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
           void this.router.navigate(['/app'], {
            queryParams: { toast: 'login-success' }
          });
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
