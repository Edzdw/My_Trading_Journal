import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.css',
})
export class AppSidebarComponent {
  @Output() close = new EventEmitter<void>();
  @Output() navigateItem = new EventEmitter<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly tradeMenuOpen = signal(true);

  protected toggleTradeMenu(): void {
    this.tradeMenuOpen.update((value) => !value);
  }
   protected onClose(): void {
    this.close.emit();
  }

  protected onNavigate(): void {
    this.navigateItem.emit();
  }
}