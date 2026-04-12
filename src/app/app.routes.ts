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
      import('./features/auth/pages/login-page/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'register',
    canActivate: [publicAuthGuard],
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page.component').then((m) => m.RegisterPageComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/pages/protected-page/protected-page.component').then((m) => m.ProtectedPageComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'trades'
      },
      {
        path: 'trades',
        loadComponent: () =>
          import('./features/trade/pages/trade-overview-page/trade-overview-page.component').then((m) => m.TradeOverviewPageComponent)
      },
      {
        path: 'trades/list',
        loadComponent: () =>
          import('./features/trade/pages/trade-list-page/trade-list-page.component').then((m) => m.TradeListPageComponent)
      },
      {
        path: 'trades/new',
        loadComponent: () =>
          import('./features/trade/pages/trade-create-page/trade-create-page.component').then((m) => m.TradeCreatePageComponent)
      },
      {
        path: 'trades/import',
        loadComponent: () =>
          import('./features/trade/pages/trade-import-page/trade-import-page.component').then((m) => m.TradeImportPageComponent)
      },
      {
        path: 'trades/:tradeId/edit',
        loadComponent: () =>
          import('./features/trade/pages/trade-edit-page/trade-edit-page.component').then((m) => m.TradeEditPageComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];