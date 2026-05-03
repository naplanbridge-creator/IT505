import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { AlertKind, AlertMessage } from './app.models';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  readonly toast = signal<AlertMessage | null>(null);

  private toastTimerId: ReturnType<typeof setTimeout> | undefined;
  private readonly language = inject(LanguageService);

  showToast(message: string, kind: AlertKind): void {
    this.toast.set({ message, kind });

    if (this.toastTimerId) {
      clearTimeout(this.toastTimerId);
    }

    this.toastTimerId = setTimeout(() => {
      this.toast.set(null);
      this.toastTimerId = undefined;
    }, 3200);
  }

  dismissToast(): void {
    this.toast.set(null);

    if (this.toastTimerId) {
      clearTimeout(this.toastTimerId);
      this.toastTimerId = undefined;
    }
  }

  extractErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;

      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }

      if (payload && typeof payload === 'object' && 'message' in payload) {
        const message = (payload as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }

      if (error.message) {
        return error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallbackMessage;
  }

  formatDate(value: string): string {
    if (!value) {
      return this.language.current() === 'ar' ? 'غير متاح' : 'N/A';
    }

    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat(this.language.current() === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
