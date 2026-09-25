import { Component, inject } from '@angular/core';

import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './app-language-switcher.component.html',
  styleUrl: './app-language-switcher.component.css'
})
export class LanguageSwitcherComponent {
  protected readonly i18n = inject(I18nService);
}