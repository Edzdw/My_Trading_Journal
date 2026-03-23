import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-protected-page',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="min-h-dvh bg-transparent px-4 py-6 md:px-6">
      <div class="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur">
        <header class="border-b border-slate-200/80 px-6 py-5">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Trade Journal</p>
              <h1 class="mt-2 text-2xl font-semibold text-slate-950">Protected App</h1>
              <p class="mt-1 text-sm text-slate-500">Phase 1 includes auth and trade management foundations.</p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <nav class="flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600">
                <a
                  routerLink="/app/trades"
                  routerLinkActive="bg-white text-slate-950 shadow-sm"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="rounded-full px-4 py-2 transition">
                  Trades
                </a>
                <a
                  routerLink="/app/trades/new"
                  routerLinkActive="bg-white text-slate-950 shadow-sm"
                  class="rounded-full px-4 py-2 transition">
                  New Trade
                </a>
              </nav>

              <button
                type="button"
                class="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                [disabled]="isSubmitting()"
                (click)="logout()">
                {{ isSubmitting() ? 'Signing out...' : 'Log out' }}
              </button>
            </div>
          </div>

          @if (submitError()) {
            <div class="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
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
  private readonly authService = inject(AuthService);
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
          this.submitError.set(error?.error?.message ?? 'Unable to sign out right now.');
        }
      });
  }
}
