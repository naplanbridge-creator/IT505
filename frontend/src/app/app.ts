import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LanguageService } from './language.service';
import { ThemeService } from './theme.service';
import { UiFeedbackService } from './ui-feedback.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly feedback = inject(UiFeedbackService);
  readonly language = inject(LanguageService);
  readonly theme = inject(ThemeService);

  t(ar: string, en: string): string {
    return this.language.current() === 'ar' ? ar : en;
  }

  setLanguage(language: 'ar' | 'en'): void {
    this.language.setLanguage(language);
  }

  setTheme(theme: 'dark' | 'light'): void {
    this.theme.setTheme(theme);
  }

  toggleLanguage(): void {
    this.setLanguage(this.language.current() === 'ar' ? 'en' : 'ar');
  }

  toggleTheme(): void {
    this.setTheme(this.theme.current() === 'dark' ? 'light' : 'dark');
  }
}
