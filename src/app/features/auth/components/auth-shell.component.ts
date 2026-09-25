import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { LanguageSwitcherComponent } from '../../../shared/components/app-language-switcher/app-language-switcher.component';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink, LanguageSwitcherComponent],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.css'
})
export class AuthShellComponent {
  protected readonly i18n = inject(I18nService);

  readonly activeView = input.required<'login' | 'register'>();

  protected readonly direction = signal<'left' | 'right'>('left');

  private previousView: 'login' | 'register' | null = null;

  constructor() {
    effect(() => {
      const current = this.activeView();

      if (this.previousView) {
        if (this.previousView === 'login' && current === 'register') {
          this.direction.set('left');
        } else {
          this.direction.set('right');
        }
      }

      this.previousView = current;
    });
  }
}