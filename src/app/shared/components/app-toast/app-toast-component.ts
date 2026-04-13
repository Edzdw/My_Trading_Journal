import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toast().visible) {
      <div class="pointer-events-none fixed top-4 right-4 z-[9999]">
        <div
          class="pointer-events-auto min-w-[280px] max-w-[360px] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300"
          [ngClass]="toastClasses()"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-medium leading-5">
              {{ toast().message }}
            </p>

            <button
              type="button"
              class="shrink-0 text-current/70 transition hover:text-current"
              (click)="hide()"
              aria-label="Close toast"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);

  readonly toast = this.toastService.toastState;

  readonly toastClasses = computed(() => {
    const type = this.toast().type;

    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-500/95 text-white';
      case 'error':
        return 'border-red-200 bg-red-500/95 text-white';
      case 'warning':
        return 'border-amber-200 bg-amber-500/95 text-white';
      case 'info':
      default:
        return 'border-slate-200 bg-slate-900/95 text-white';
    }
  });

  hide(): void {
    this.toastService.hide();
  }
}