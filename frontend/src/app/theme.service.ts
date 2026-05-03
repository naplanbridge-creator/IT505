import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<AppTheme>('dark');

  constructor() {
    const stored = this.readStoredTheme();
    this.current.set(stored);
    this.applyDocumentTheme(stored);
  }

  setTheme(theme: AppTheme): void {
    this.current.set(theme);
    this.applyDocumentTheme(theme);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('it505.theme', theme);
    }
  }

  private readStoredTheme(): AppTheme {
    if (typeof localStorage === 'undefined') {
      return 'dark';
    }

    const stored = localStorage.getItem('it505.theme');
    return stored === 'light' ? 'light' : 'dark';
  }

  private applyDocumentTheme(theme: AppTheme): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset['theme'] = theme;
  }
}
