import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

type ThemePreference = 'light' | 'dark';

const THEME_STORAGE_KEY = 'trade-journal.theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly themePreferenceSignal = signal<ThemePreference>('light');

  readonly themePreference = this.themePreferenceSignal.asReadonly();
  readonly isDarkMode = computed(() => this.themePreferenceSignal() === 'dark');

  initializeTheme(): void {
    const themePreference = this.readStoredThemePreference() ?? this.readSystemThemePreference();
    this.applyTheme(themePreference);
  }

  toggleTheme(): void {
    this.applyTheme(this.isDarkMode() ? 'light' : 'dark');
  }

  private applyTheme(themePreference: ThemePreference): void {
    this.themePreferenceSignal.set(themePreference);

    if (!this.isBrowser) {
      return;
    }

    const rootElement = this.document.documentElement;
    rootElement.classList.toggle('dark', themePreference === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }

  private readStoredThemePreference(): ThemePreference | null {
    if (!this.isBrowser) {
      return null;
    }

    const storedThemePreference = localStorage.getItem(THEME_STORAGE_KEY);
    return storedThemePreference === 'light' || storedThemePreference === 'dark'
      ? storedThemePreference
      : null;
  }

  private readSystemThemePreference(): ThemePreference {
    if (!this.isBrowser || typeof window.matchMedia !== 'function') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
