import { NgClass } from '@angular/common';
import { Component, inject, input, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { LanguageSwitcherComponent } from '../../../shared/components/app-language-switcher/app-language-switcher.component';

@Component({
  selector: 'app-auth-shell',
  imports: [NgClass, RouterLink, LanguageSwitcherComponent],
  template: `
    <section
  class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100"
>
  <!-- background blobs -->
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
    <div class="absolute right-[-80px] top-[80px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"></div>
    <div class="absolute bottom-[-120px] left-[20%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
  </div>

  <!-- top bar -->
  <div class="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6">
    <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300/90">
      {{ i18n.t('common.appName') }}
    </p>

    <div class="flex items-center gap-3">
      <app-language-switcher />
    </div>
  </div>

  <!-- center -->
  <div class="relative z-10 flex items-center justify-center px-4 pb-10 pt-4">
    <div class="w-full max-w-md">
      
      <!-- tabs -->

      <div
  class="relative mb-6 flex rounded-full border border-white/10 bg-white/[0.05] p-1 backdrop-blur-xl"
>
  <div
    class="absolute inset-y-1 z-0 rounded-full border border-white/15 bg-white/[0.12] shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    [style.width]="'calc(50% - 0.25rem)'"
    [style.left]="activeView() === 'login' ? '0.25rem' : 'calc(50% + 0rem)'"
  ></div>

  <a
    routerLink="/login"
    class="relative z-10 flex-1 rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200"
    [ngClass]="activeView() === 'login' ? 'text-white' : 'text-slate-300 hover:text-white'"
  >
    {{ i18n.t('auth.shell.tabs.login') }}
  </a>

  <a
    routerLink="/register"
    class="relative z-10 flex-1 rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200"
    [ngClass]="activeView() === 'register' ? 'text-white' : 'text-slate-300 hover:text-white'"
  >
    {{ i18n.t('auth.shell.tabs.register') }}
  </a>
</div>

      <!-- glass card -->
      <div
  class="glass-panel rounded-[28px] p-5 sm:p-6"
  [ngClass]="direction() === 'left' ? 'slide-left' : 'slide-right'"
>
  <ng-content />
</div>
    </div>
  </div>
</section>
  `
})
export class AuthShellComponent {
  protected readonly i18n = inject(I18nService);
  readonly activeView = input.required<'login' | 'register'>();

readonly direction = signal<'left' | 'right'>('left');
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
