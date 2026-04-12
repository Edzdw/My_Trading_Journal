import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html'
})
export class AppSidebarComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly tradeMenuOpen = signal(true);

  protected toggleTradeMenu(): void {
    this.tradeMenuOpen.update((value) => !value);
  }
}