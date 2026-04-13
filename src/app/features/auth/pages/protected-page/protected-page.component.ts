import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../data-access/auth.service';
import { AppHeaderComponent } from '../../../../shared/components/app-header/app-header.component';
import { AppSidebarComponent } from '../../../../shared/components/app-sidebar/app-sidebar.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-protected-page',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, AppSidebarComponent],
  templateUrl: './protected-page.component.html'
})
export class ProtectedPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
   private readonly toastService = inject(ToastService);
   private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  desktopSidebarCollapsed = signal(false);
  desktopSidebarTemporaryExpanded = signal(false);
  mobileSidebarOpen = signal(false);

  desktopSidebarExpanded = computed(() => {
    return !this.desktopSidebarCollapsed() || this.desktopSidebarTemporaryExpanded();
  });

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.mobileSidebarOpen.set(false);

        if (this.desktopSidebarTemporaryExpanded()) {
          this.desktopSidebarTemporaryExpanded.set(false);
        }
      });

    effect(() => {
      const isOpen = this.mobileSidebarOpen();

      if (isOpen) {
        this.document.body.classList.add('overflow-hidden', 'touch-none');
        this.document.documentElement.classList.add('overflow-hidden');
      } else {
        this.document.body.classList.remove('overflow-hidden', 'touch-none');
        this.document.documentElement.classList.remove('overflow-hidden');
      }
    });
  }

  toggleDesktopSidebar(): void {
    const nextCollapsed = !this.desktopSidebarCollapsed();
    this.desktopSidebarCollapsed.set(nextCollapsed);
    this.desktopSidebarTemporaryExpanded.set(false);
  }

  expandDesktopSidebarTemporarily(): void {
    if (this.desktopSidebarCollapsed()) {
      this.desktopSidebarTemporaryExpanded.set(true);
    }
  }

  closeDesktopTemporarySidebar(): void {
    if (this.desktopSidebarCollapsed()) {
      this.desktopSidebarTemporaryExpanded.set(false);
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  ngOnInit(): void {
  // load user
  this.authService
    .loadCurrentUserProfile()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe();

  // 👇 xử lý toast
  this.route.queryParamMap
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((params) => {
      const toast = params.get('toast');

      if (toast === 'login-success') {
        this.toastService.show('Đăng nhập thành công', 'success');

        // clear query param để tránh reload lại bị spam toast
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
}
}