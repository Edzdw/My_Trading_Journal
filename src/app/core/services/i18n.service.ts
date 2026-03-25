import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { readStorageItem, writeStorageItem } from '../../shared/utils/browser-storage.util';
import { LanguageCode, LanguageOption, TranslationDictionary, TranslationValue } from '../i18n/i18n.models';
import { enTranslations } from '../i18n/translations/en';
import { viTranslations } from '../i18n/translations/vi';

const LANGUAGE_STORAGE_KEY = 'trade-journal.language';
const DEFAULT_LANGUAGE: LanguageCode = 'en';
const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tieng Viet' }
];

const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: enTranslations,
  vi: viTranslations
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storage = this.isBrowser ? localStorage : null;
  private readonly languageSignal = signal<LanguageCode>(DEFAULT_LANGUAGE);

  readonly currentLanguage = this.languageSignal.asReadonly();
  readonly languageOptions = SUPPORTED_LANGUAGES;
  readonly translations = computed(() => TRANSLATIONS[this.languageSignal()]);

  initializeLanguage(): void {
    const storedLanguage = readStorageItem(this.storage, LANGUAGE_STORAGE_KEY);
    const language = this.isSupportedLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
    this.applyLanguage(language);
  }

  setLanguage(language: LanguageCode): void {
    this.applyLanguage(language);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const translatedValue =
      this.resolveTranslation(this.translations(), key) ??
      this.resolveTranslation(TRANSLATIONS[DEFAULT_LANGUAGE], key);

    if (typeof translatedValue !== 'string') {
      return key;
    }

    return this.interpolate(translatedValue, params);
  }

  private applyLanguage(language: LanguageCode): void {
    this.languageSignal.set(language);
    this.document.documentElement.lang = language;

    if (!this.isBrowser) {
      return;
    }

    writeStorageItem(this.storage, LANGUAGE_STORAGE_KEY, language);
  }

  private resolveTranslation(dictionary: TranslationDictionary, key: string): TranslationValue | null {
    const segments = key.split('.');
    let currentValue: TranslationValue = dictionary;

    for (const segment of segments) {
      if (typeof currentValue === 'string') {
        return null;
      }

      currentValue = currentValue[segment];

      if (currentValue === undefined) {
        return null;
      }
    }

    return currentValue;
  }

  private interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) {
      return template;
    }

    return Object.entries(params).reduce(
      (result, [paramKey, paramValue]) => result.replaceAll(`{${paramKey}}`, String(paramValue)),
      template
    );
  }

  private isSupportedLanguage(language: string | null): language is LanguageCode {
    return SUPPORTED_LANGUAGES.some((option) => option.code === language);
  }
}
