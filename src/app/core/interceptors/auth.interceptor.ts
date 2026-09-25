import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';

import { AuthService } from '../../features/auth/data-access/auth.service';

const refreshAttempted = new HttpContextToken<boolean>(() => false);
let refreshRequest$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.endsWith('/auth/refresh')) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();

  const clonedReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    : req;

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error.status !== 401 || req.context.get(refreshAttempted)) {
        if (error.status === 401) {
          expireSession(authService, router);
        }

        return throwError(() => error);
    }

      const refreshToken = authService.getRefreshToken();

      if (!refreshToken) {
        expireSession(authService, router);
        return throwError(() => error);
      }

      return getRefreshRequest(authService, router).pipe(
        switchMap((newAccessToken) =>
          next(
            req.clone({
              context: req.context.set(refreshAttempted, true),
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`
              }
            })
          ).pipe(
            catchError((retryError) => {
              if (retryError.status === 401) {
                expireSession(authService, router);
              }

              return throwError(() => retryError);
            })
          )
        )
      );
    })
  );
};

function getRefreshRequest(authService: AuthService, router: Router): Observable<string> {
  if (!refreshRequest$) {
    refreshRequest$ = authService.refreshSession().pipe(
      map((response) => response.tokens.accessToken),
      tap({ error: () => expireSession(authService, router) }),
      shareReplay({ bufferSize: 1, refCount: false }),
      finalize(() => {
        refreshRequest$ = null;
      })
    );
  }

  return refreshRequest$;
}

function expireSession(authService: AuthService, router: Router): void {
  authService.handleUnauthorized();

  if (!router.url.startsWith('/login')) {
    void router.navigate(['/login'], {
      queryParams: { reason: 'session-expired' }
    });
  }
}