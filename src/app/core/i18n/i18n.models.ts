export type LanguageCode = 'en' | 'vi';

export type TranslationValue = string | TranslationDictionary;

export interface TranslationDictionary {
  [key: string]: TranslationValue;
}

export interface LanguageOption {
  code: LanguageCode;
  label: string;
}
