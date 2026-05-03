import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly current = signal<AppLanguage>('ar');

  constructor() {
    const stored = this.readStoredLanguage();
    this.current.set(stored);
    this.applyDocumentDirection(stored);
  }

  setLanguage(language: AppLanguage): void {
    this.current.set(language);
    this.applyDocumentDirection(language);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('it505.language', language);
    }
  }

  private readStoredLanguage(): AppLanguage {
    if (typeof localStorage === 'undefined') {
      return 'ar';
    }

    const stored = localStorage.getItem('it505.language');
    return stored === 'en' ? 'en' : 'ar';
  }

  private applyDocumentDirection(language: AppLanguage): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }
}
