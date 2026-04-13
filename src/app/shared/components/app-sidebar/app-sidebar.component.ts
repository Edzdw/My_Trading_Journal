import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html'
})
export class AppSidebarComponent {
  @Input() collapsed = false;
  @Input() mobile = false;
  @Input() desktopCollapsedBase = false;

  @Output() navigateItem = new EventEmitter<void>();
  @Output() requestTemporaryExpand = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly tradeMenuOpen = signal(true);

  protected toggleTradeMenu(): void {
    this.tradeMenuOpen.update((value) => !value);
  }

  protected onTradeRootClick(): void {
    if (!this.mobile && this.collapsed && this.desktopCollapsedBase) {
      this.requestTemporaryExpand.emit();

      if (!this.tradeMenuOpen()) {
        this.tradeMenuOpen.set(true);
      }
      return;
    }

    this.toggleTradeMenu();
  }

  protected onNavigate(): void {
    this.navigateItem.emit();
  }

  protected onToggleSidebar(): void {
    if (!this.mobile) {
      this.toggleCollapse.emit();
    }
  }
}