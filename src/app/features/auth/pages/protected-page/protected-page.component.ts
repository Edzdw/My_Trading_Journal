import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '../../data-access/auth.service';
import { AppHeaderComponent } from '../../../../shared/components/app-header/app-header.component';
import { AppSidebarComponent } from '../../../../shared/components/app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-protected-page',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, AppSidebarComponent],
  templateUrl: './protected-page.component.html'
})
export class ProtectedPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.authService
      .loadCurrentUserProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}