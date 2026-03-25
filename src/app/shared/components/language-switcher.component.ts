import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  imports: [NgClass],
  template: `
    <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-950/80">
      <span class="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        {{ i18n.t('common.language') }}
      </span>

      @for (option of i18n.languageOptions; track option.code) {
        <button
          type="button"
          class="rounded-full px-3 py-1.5 text-xs font-semibold transition"
          [ngClass]="
            i18n.currentLanguage() === option.code
              ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'
              : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300'
          "
          (click)="i18n.setLanguage(option.code)">
          {{ option.label }}
        </button>
      }
    </div>
  `
})
export class LanguageSwitcherComponent {
  protected readonly i18n = inject(I18nService);
}
