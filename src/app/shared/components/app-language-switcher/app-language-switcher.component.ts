import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="flex items-center rounded-2xl border border-white/10 bg-white/[0.05] p-1 backdrop-blur">
      @for (option of i18n.languageOptions; track option.code) {
        <button
          type="button"
          class="rounded-xl px-3 py-1.5 text-xs font-semibold transition"
          [ngClass]="
            i18n.currentLanguage() === option.code
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
          "
          (click)="i18n.setLanguage(option.code)">
          {{ option.code.toUpperCase() }}
        </button>
      }
    </div>
  `
})
export class LanguageSwitcherComponent {
  protected readonly i18n = inject(I18nService);
}