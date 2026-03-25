import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { publicAuthGuard } from './core/guards/public-auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    canActivate: [publicAuthGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'register',
    canActivate: [publicAuthGuard],
    loadComponent: () =>
      import('./features/auth/pages/register-page.component').then((m) => m.RegisterPageComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/pages/protected-page.component').then((m) => m.ProtectedPageComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'trades'
      },
      {
        path: 'trades',
        loadComponent: () =>
          import('./features/trade/pages/trade-list-page.component').then((m) => m.TradeListPageComponent)
      },
      {
        path: 'trades/new',
        loadComponent: () =>
          import('./features/trade/pages/trade-create-page.component').then((m) => m.TradeCreatePageComponent)
      },
      {
        path: 'trades/:tradeId/edit',
        loadComponent: () =>
          import('./features/trade/pages/trade-edit-page.component').then((m) => m.TradeEditPageComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
