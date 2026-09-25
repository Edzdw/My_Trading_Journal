import { Component, DestroyRef, OnInit, inject, signal, computed, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../data-access/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AppShellComponent } from '../../../../shared/components/app-shell/app-shell.component';

@Component({
  selector: 'app-protected-page',
  standalone: true,
  imports: [AppShellComponent],
  templateUrl: './protected-page.component.html',
})
export class ProtectedPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.authService
      .loadCurrentUserProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const toast = params.get('toast');

        if (toast === 'login-success') {
          this.toastService.show(
            'Đăng nhập thành công',
            'success',
          );

          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
        }
      });
  }
}
