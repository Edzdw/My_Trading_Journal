import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink],
  template: `
    <section class="flex min-h-dvh items-center justify-center px-4 py-10">
      <div class="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
        <div class="flex flex-col justify-between bg-slate-950 px-8 py-10 text-slate-100 md:px-10">
          <div class="space-y-4">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Trade Journal</p>
            <h1 class="max-w-sm text-4xl font-semibold leading-tight">Build disciplined trading habits with a cleaner workflow.</h1>
            <p class="max-w-md text-sm leading-6 text-slate-300">
              Start with authentication first. Portfolio, trades, and journal features can plug into this foundation later without reshaping the app.
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Current focus</p>
            <p class="mt-2 text-sm text-slate-200">
              Simple auth pages, local token persistence, and a clean feature-based Angular structure.
            </p>
          </div>
        </div>

        <div class="flex items-center px-6 py-8 md:px-10">
          <div class="w-full">
            <div class="mb-8 flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600">
              <a
                routerLink="/login"
                class="flex-1 rounded-full px-4 py-2 text-center transition"
                [class.bg-white]="activeView() === 'login'"
                [class.text-slate-950]="activeView() === 'login'">
                Sign in
              </a>
              <a
                routerLink="/register"
                class="flex-1 rounded-full px-4 py-2 text-center transition"
                [class.bg-white]="activeView() === 'register'"
                [class.text-slate-950]="activeView() === 'register'">
                Create account
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
  readonly activeView = input.required<'login' | 'register'>();
}
