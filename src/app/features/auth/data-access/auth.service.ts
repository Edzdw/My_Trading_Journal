import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, computed, inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { AUTH_STORAGE_KEYS } from '../../../core/config/auth-storage.config';
import { AuthState } from '../../../core/types/auth-state.type';
import {
  removeStorageItem,
  readStorageItem,
  writeStorageItem
} from '../../../shared/utils/browser-storage.util';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../types/auth.models';
import { AuthApiService } from './auth-api.service';

const INITIAL_AUTH_STATE: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storage = this.isBrowser ? localStorage : null;

  private readonly authStateSignal = signal<AuthState>(INITIAL_AUTH_STATE);
  private readonly currentUserSignal = signal<UserProfile | null>(null);

  readonly authState = this.authStateSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.authStateSignal().isAuthenticated);
  readonly currentUserEmail = computed(() => this.currentUserSignal()?.email ?? null);
  readonly currentUserInitial = computed(() => {
    const email = this.currentUserSignal()?.email;
    return email ? email.charAt(0).toUpperCase() : '?';
  });

  restoreSession(): void {
    if (!this.isBrowser) {
      return;
    }

    this.authStateSignal.set(this.readStoredState());
  }

  loadCurrentUserProfile(): Observable<UserProfile | null> {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      this.currentUserSignal.set(null);
      return of(null);
    }

    if (this.currentUserSignal()) {
      return of(this.currentUserSignal());
    }

    return this.authApi.profile(accessToken).pipe(
      map((response) => response.user),
      tap((user) => this.currentUserSignal.set(user)),
      catchError(() => {
        this.currentUserSignal.set(null);
        return of(null);
      })
    );
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.authApi.login(payload).pipe(tap((response) => this.setSession(response)));
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.authApi.register(payload).pipe(tap((response) => this.setSession(response)));
  }

  logout(): Observable<void> {
    const refreshToken = this.authStateSignal().refreshToken;

    if (!refreshToken) {
      this.clearSession();
      return of(void 0);
    }

    return this.authApi.logout(refreshToken).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.clearSession())
    );
  }

  getAccessToken(): string | null {
    this.restoreSessionIfNeeded();
    return this.authStateSignal().accessToken;
  }

  getRefreshToken(): string | null {
    this.restoreSessionIfNeeded();
    return this.authStateSignal().refreshToken;
  }

  private setSession(response: AuthResponse): void {
    writeStorageItem(this.storage, AUTH_STORAGE_KEYS.accessToken, response.tokens.accessToken);
    writeStorageItem(this.storage, AUTH_STORAGE_KEYS.refreshToken, response.tokens.refreshToken);

    this.currentUserSignal.set(response.user);
    this.authStateSignal.set({
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
      isAuthenticated: true
    });
  }

  private clearSession(): void {
    removeStorageItem(this.storage, AUTH_STORAGE_KEYS.accessToken);
    removeStorageItem(this.storage, AUTH_STORAGE_KEYS.refreshToken);
    this.currentUserSignal.set(null);
    this.authStateSignal.set(INITIAL_AUTH_STATE);
  }

  private restoreSessionIfNeeded(): void {
    if (!this.isBrowser || this.authStateSignal().isAuthenticated) {
      return;
    }

    this.authStateSignal.set(this.readStoredState());
  }

  private readStoredState(): AuthState {
    const accessToken = readStorageItem(this.storage, AUTH_STORAGE_KEYS.accessToken);
    const refreshToken = readStorageItem(this.storage, AUTH_STORAGE_KEYS.refreshToken);

    if (!accessToken || !refreshToken) {
      if (accessToken || refreshToken) {
        removeStorageItem(this.storage, AUTH_STORAGE_KEYS.accessToken);
        removeStorageItem(this.storage, AUTH_STORAGE_KEYS.refreshToken);
      }

      return INITIAL_AUTH_STATE;
    }

    return {
      accessToken,
      refreshToken,
      isAuthenticated: true
    };
  }
}
