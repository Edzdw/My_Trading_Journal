import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../../features/auth/data-access/auth.service';

export const publicAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  authService.restoreSession();

  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/app']);
  }

  return true;
};
