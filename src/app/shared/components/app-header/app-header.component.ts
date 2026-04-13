import { Component, DestroyRef, inject, signal,Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageSwitcherComponent } from '../../../shared/components/app-language-switcher/app-language-switcher.component';
import { AuthService } from '../../../features/auth/data-access/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LanguageSwitcherComponent],
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {

  @Input() mobileSidebarOpen = false;
  @Input() desktopSidebarCollapsed = false;

  @Output() menuClick = new EventEmitter<void>();
  @Output() desktopToggleClick = new EventEmitter<void>();

  
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly themeService = inject(ThemeService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

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