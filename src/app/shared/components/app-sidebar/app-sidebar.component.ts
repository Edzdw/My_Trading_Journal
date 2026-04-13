import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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

  @Input() collapsed = false;
  @Input() mobile = false;
    // trạng thái collapsed gốc từ desktop
  @Input() desktopCollapsedBase = false;

  @Output() navigateItem = new EventEmitter<void>();
  @Output() requestTemporaryExpand = new EventEmitter<void>();

  protected readonly i18n = inject(I18nService);
  protected readonly tradeMenuOpen = signal(true);

  protected toggleTradeMenu(): void {
    this.tradeMenuOpen.update((value) => !value);
  }

  onTradeRootClick() {
  if (!this.mobile && this.collapsed && this.desktopCollapsedBase) {
    this.requestTemporaryExpand.emit();
    if (!this.tradeMenuOpen()) {
      this.tradeMenuOpen.set(true);
    }
    return;
  }

  this.toggleTradeMenu();
}

  onNavigate() {
    this.navigateItem.emit();
  }
}