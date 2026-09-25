import { Component, DestroyRef, DOCUMENT, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, AppSidebarComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly sidebarOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (window.innerWidth <= 760) {
          this.sidebarOpen.set(false);
        }
      });

    effect(() => {
      const isOpen = this.sidebarOpen();

      if (isOpen && window.innerWidth <= 760) {
        this.document.body.classList.add('overflow-hidden');
        this.document.documentElement.classList.add('overflow-hidden');
      } else {
        this.document.body.classList.remove('overflow-hidden');
        this.document.documentElement.classList.remove('overflow-hidden');
      }
    });
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
